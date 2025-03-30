const jwt = require("jsonwebtoken")
const { handleHttpError } = require("./handleError")
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
        //console.error(err)
        handleHttpError(res, "INVALID_TOKEN", 400)
    }
}
module.exports = { tokenSign, verifyToken }