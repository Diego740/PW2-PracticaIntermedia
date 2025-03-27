const jwt = require("jsonwebtoken")
const secret = process.env.TOKEN_SECRET
const tokenSign = (user) => {
    const sign = jwt.sign(
        {
            _id: user._id,
            role: user.role
        },
        secret,
        {
            expiresIn: "1h"
        }
    )
    return sign
}
const verifyToken = (tokenJwt) => {
    try {
        return jwt.verify(tokenJwt, secret)
    } catch (err) {
        console.error(err)
    }
}
module.exports = { tokenSign, verifyToken }