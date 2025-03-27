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

module.exports = {validatorCreateItem}