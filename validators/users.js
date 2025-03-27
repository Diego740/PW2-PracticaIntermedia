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

module.exports = {validatorCreateItem, validatorVerifyUser}