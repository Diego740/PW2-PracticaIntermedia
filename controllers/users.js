const UserModel = require('../models/users.js')
const { matchedData } = require('express-validator')
const { handleHttpError } = require('../utils/handleError.js')


const createItem = async (req, res) => {
    try {
        const body = matchedData(req) //El dato filtrado por el modelo (probar con body=req)
        const data = await UserModel.create(body)
        res.send(data)
    }catch(err){
        handleHttpError(res, 'ERROR_CREATE_ITEMS')
    }
}

module.exports = {createItem}