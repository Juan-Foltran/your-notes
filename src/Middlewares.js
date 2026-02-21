//middleware jwt
const jwt = require ('jsonwebtoken')
const cookies = require ('cookie-parser')

function authenticate (req, res, next){
    const token = req.cookies.token

    if(!token){
        return res.status(401).json({ error: 'access denied' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err){
           return res.status(403).json({ error: 'token invalid or expired, log in again' })
        }

        req.user = user
        next ()
    })
}

module.exports = {
    authenticate 
}