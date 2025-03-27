const UserModel = require("../models/users.js");
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");
const { encryptPassword, isPasswordCorrect } = require("../utils/handlePassword.js");
const { tokenSign } = require("../utils/handleJWT.js");


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
        const token = tokenSign(newUser);

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

const validateUser = async (req, res) => {};


const checkLogUser = async (req, res) => {
    try {
        const body = matchedData(req);

        //ENCONTRAR USUARIO
        const user = await UserModel.findOne({ email: body.email });

        //SI NO EXISTE O NO VERIFICADO
        if (!user || !user.verificated) {
            return res.status(404).json({ message: "Usuario no encontrado o no verificado" });
        }

        //COMPROBAR CONTRASEÑAS ENCRIPTADAS
        const validPassword = await isPasswordCorrect(body.password, user.password);
        if (validPassword) {
            //CREAR TOKEN JWT
            const token = tokenSign(user);

            return res.status(200).json({ message: "Login exitoso", token });
        }

        //CONTRASEÑA INCORRECTA
        return res.status(401).json({ message: "Contraseña incorrecta" });

    } catch (err) {
        console.error(err);
        handleHttpError(res, "ERROR_LOGIN", 500);
    }
};

module.exports = { createItem, validateUser, checkLogUser };
