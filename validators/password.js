const {check} = require("express-validator");
const validateResults = require("../utils/handleValidator.js")

const validatorGetToken = [
    //check("name").exists().notEmpty(),
    check("email")
        .exists().notEmpty().isEmail().withMessage("Debe ser un email válido"),
    validateResults
];

const validatorPassword = [
    //check("name").exists().notEmpty(),
    check("password")
        .exists().notEmpty()
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres"),
    validateResults
];

module.exports = {validatorGetToken, validatorPassword}