const UserModel = require("../models/users.js");
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");


const createItem = async (req, res) => {
    try {
        const body = matchedData(req); //El dato filtrado por el modelo (probar con body=req)

        //Verificar email registrado
        const existingUser = await UserModel.findOne({ email: body.email });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "El email ya está registrado" });
        }

        const data = await UserModel.create(body);
        res.send(data);
    } catch (err) {
        handleHttpError(res, "ERROR_CREATE_ITEMS");
    }
};

module.exports = { createItem };
