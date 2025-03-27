const UserModel = require("../models/users.js");
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");
const { encryptPassword } = require("../utils/handlePassword.js");
const jwt = require("jsonwebtoken");


const createItem = async (req, res) => {
    try {
        const body = matchedData(req); //El dato filtrado por el modelo (probar con body=req)

        //Verificar email registrado
        const existingUser = await UserModel.findOne({ email: body.email });
        if (existingUser) {
            return res.status(409).json({ message: "El email ya está en uso" });
        }

        //Cifrar la contraseña
        const hashedPassword = await encryptPassword(body.password);

        //Generar código de verificación de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        
        //Crear usuario
        const newUser = await UserModel.create({
            email: body.email,
            password: hashedPassword,
            //role: "user",
            //attemps: 3,
            code: verificationCode,
            //verificated: false
        });
        
        //const newUser = await UserModel.create(body);

        //Generar token JWT
        const token = jwt.sign({ id: newUser._id }, process.env.TOKEN_SECRET, { expiresIn: "1h" });

        console.log(verificationCode);
        return res.status(201).json({
            email: newUser.email,
            verificated: newUser.verificated,
            role: newUser.role,
            token,
        });
    } catch (err) {
        //console.error(err);
        handleHttpError(res, "ERROR_CREATE_ITEMS", 500);
    }
};

module.exports = { createItem };
