const {check} = require("express-validator");
const validateResults = require("../utils/handleValidator.js")

const validatorCreateItem = [
    //check("name").exists().notEmpty(),
    check("email")
        .exists().notEmpty().isEmail().withMessage("Debe ser un email válido"),
    check("password")
        .exists().notEmpty()
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
    validateResults
];

const validatorVerifyUser = [
    check("code")
        .exists().notEmpty()
        .isLength({ min: 6 }).withMessage("Debe ingresar un código de verificación"),
    validateResults
];

const validatorDataUser = [

    check("email")
        .exists().notEmpty().isEmail().withMessage("Debe ser un email válido"),

    check("name")
        .exists().notEmpty().withMessage("Ingrese un nombre válido"),


    check("surnames")
        .exists().notEmpty().withMessage("Ingrese unos apellidos válidos"),

    check("nif")
        .exists().notEmpty()
        .matches(/^\d{8}[A-Z]$/).withMessage("El NIF debe tener el formato adecuado")
        .custom((value) => {
            const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
            const numero = parseInt(value.slice(0, 8), 10);
            const letra = value.slice(8);
            if (letras[numero % 23] !== letra) {
                throw new Error("El NIF no es válido");
            }
            return true;
        }),
    validateResults
];

module.exports = {validatorCreateItem, validatorVerifyUser, validatorDataUser}