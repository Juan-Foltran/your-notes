const express = require ('express')
const route = express.Router()
const pool = require('../database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookies =  require ('cookie-parser')
const {authenticate} = require('./Middlewares')
const { Result } = require('pg')

// route for create user

route.post ('/create-user', (req, res) => {
    const {name, email, password} = req.body
    const errors = []
    
    if (!name){
         errors.push('Name is required')
        }
    if (!email){ 
        errors.push('Email is required')
    }else if (!email.includes('@')){
        errors.push('Invalid email format');
    }
    if (!password) {
        errors.push('Password is required')
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            errors: errors 
        })
    }

    pool.connect((err, client, release) => {
        if (err){
            return console.error('Error acquiring client', err.stack)
        }
        client.query('select * from users where email = $1', [email], (err, result) => {
            
            if (err){
                release()
                return console.error('Error executing query');
            }
            if (result.rows.length > 0){
                release()
                return res.status(409).json({message: 'User already registered'})
            }else{
                bcrypt.hash(req.body.password, 10, (errBcrypt, hash) => {
                    if (errBcrypt){
                        release()
                        return res.status(500).json({error: errBcrypt})
                    }
                    client.query('insert into users (name, email, password) values ($1, $2, $3)', [req.body.name, email, hash], (err) => {
                        release()
                        if (err) {
                            return res.status(500).json({ error: 'Error creating user' })
                        }
                        return res.status(201).json({
                            message: 'User created successfully',
                            userCreated: { name }
                        })
                    })
                })
            }
        })
    })
})


// login route

route.post ('/login', (req, res) =>{
    const {email, password} = req.body
    const errors = []

     if (!password) {
        errors.push('Password is required')
    }

    if (!email){ 
        errors.push('Email is required')
    }else if (!email.includes('@')){
        errors.push('Invalid email format');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            errors: errors 
        })
    }

    pool.connect((err, client, release) => {

        if (err){
            return console.error('ERROR acquiring client', err.stack)
        }

        client.query('select password, id from users where email = $1', [email], async (err, result) => {
            if (err){
                release()
                return console.error('Error executing query');
            }

            if (result.rows.length === 0){
                release()
                return res.status(401).json({error: 'Invalid email or password'})
            }

            const user = result.rows[0]

            const ValidPassword = await bcrypt.compare(password, user.password)

            if (!ValidPassword){
                release()
                return res.status(401).json({error: 'Invalid email or password'})
            }


            const token = jwt.sign(
                {id: user.id},
                process.env.JWT_SECRET,
                {expiresIn: process.env.JWT_EXPIRES_IN}
            )

            res.cookie('token', token, {
                httpOnly: true,
                secure: false, 
                maxAge: process.env.COOKIE_EXPIRES_IN
            })

            release()

            return res.status(200).json({ message: 'Login successfully' })

        })
    })
})



//route for create notes
route.post('/notes', authenticate, (req, res) => {
    const {title, content} = req.body
    const user_id = req.user.id

    pool.connect((err,client,release) => {
        if (err){
            return console.error('Error acquiring client', err.stack)
        }

        client.query('insert into notes (title, content, id_user) values ($1, $2, $3) returning id_note, title, content', [title, content, user_id], (err, result) => {
            release ()

            if (err){
                return res.status(500).json({error:'ERROR creating note'})
            }

            return res.status(201).json({
                            message: 'Note created successfully',
                            NoteCreated: result.rows })
        })
    })
})

//route for list notes from user
route.get('/notes', authenticate, (req, res) => {
    const user_id = req.user.id

    pool.connect((err,client,release) =>{
        if (err){
            return console.error('Error acquiring client', err.stack)
        }

        client.query('select title, content, id_note from notes where id_user = $1', [user_id], (err, result) => {
           
            if (err){
                release()
                return res.status(500).json({ error: 'Error retrieving notes' })
            }

            if (result.rowCount === 0){
                release()
                return res.status(200).json({ message: 'create your first note' })
            }

            release()
            return res.status(200).json(result.rows)
        })
    })
})

//route for update notes from user
route.patch('/notes', authenticate, (req, res) => {
    const user_id = req.user.id
    const {title, content, id_note} = req.body

    pool.connect((err,client,release) => {
        if (err){
            return console.error('Error acquiring client', err.stack)
        }

        client.query('update notes set title = $1, content = $2 where id_note = $3 and id_user = $4 returning title, content', [title,content,id_note,user_id], (err, result) => {
            
            if (err){
                release()
                return res.status(500).json({ error: 'Error updating note' })
            }

            if (result.rowCount === 0){
                release ()
                return res.status(404).json({ error: 'Note not found' })
            }

            release()
            return res.status(200).json(result.rows[0])
        })
    })
})

//route for delete notes from user
route.delete('/notes', authenticate, (req, res) => {
    const user_id = req.user.id
    const {password, id_note} = req.body
    const errors = []

    if (!password) {
        errors.push('Password is required')
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
     
            errors: errors 
        })
    }

    pool.connect((err, client, release) => {
        if (err){
            return console.error('Error acquiring client', err.stack)
        }

        client.query('select password from users where id = $1', [user_id], async (err, result) =>{
            if (err){
                release()
                return console.error('Error executing query');
            }

             if (result.rows.length === 0){
                release()
                return res.status(401).json({ error: 'Invalid password' })
            }

            const user = result.rows[0]

            const ValidPassword = await bcrypt.compare(password, user.password)

            if (!ValidPassword){
                release()
                return res.status(401).json({ error: 'invalid password' })
            }

            client.query ('delete from notes where id_note = $1 and id_user = $2', [id_note, user_id], (err, result) => {
                if (err){
                release ()
                return res.status(500).json({ error: 'Requires note id' })
            }

            if (result.rowCount === 0){
                release ()
                return res.status(404).json({ error: 'Note not found' })
            }

            release ()
            return res.status(200).json({ message: 'Your note was deleted successfully' })

            })
        } )
    })
})

module.exports = route 