const { handleHttpError } = require("../utils/handleError")
const { verifyToken } = require("../utils/handleJWT");
const usersModel  = require("../models/users");

const authMiddleware = async (req, res, next) => {
    try{
        if (!req.headers.authorization) {
            handleHttpError(res, "NOT_TOKEN", 401)
            return
        }

        // Nos llega la palabra reservada Bearer (es un estándar) y el Token, así que me quedo con la última parte
        const token = req.headers.authorization.split(' ').pop() 
        //Del token, miramos en Payload (revisar verifyToken de utils/handleJwt)
        const dataToken = await verifyToken(token)

        if(!dataToken){
            return handleHttpError(res, "NOT_PAYLOAD_DATA", 401)

       }
        
        const query = {

            _id: dataToken._id
        }

       const user = await usersModel.findById(dataToken._id)
        req.user = user

        next()

    }catch(err){
        //console.error(err)
        handleHttpError(res, "NOT_SESSION", 401)
    }
}

module.exports = {authMiddleware}