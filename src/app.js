const express = require ('express')
const app = express ()
const port = 3333
const routes = require ('./routes')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

app.use(express.json())
app.use(cookieParser())
app.use(routes)



app.listen (port, () => {
    console.log ('server on')
})

module.exports = {
    app
}