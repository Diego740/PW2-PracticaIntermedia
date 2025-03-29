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

const validatorCompany = [
    check("company.name")
        .exists().notEmpty().withMessage("El nombre de la empresa es obligatorio"),

    check("company.cif")
        .exists().notEmpty()
        .matches(/^[A-Z]\d{8}$/).withMessage("El CIF debe tener el formato correcto"),

    check("company.street")
        .exists().notEmpty().withMessage("La calle es obligatoria"),

    check("company.number")
        .exists().notEmpty().isInt({ min: 1 }).withMessage("El número debe ser un entero positivo"),

    check("company.postal")
        .exists().notEmpty().isInt({ min: 1000, max: 99999 }).withMessage("El código postal debe ser válido"),

    check("company.city")
        .exists().notEmpty().withMessage("La ciudad es obligatoria"),

    check("company.province")
        .exists().notEmpty().withMessage("La provincia es obligatoria"),

    validateResults
];

module.exports = {validatorCreateItem, validatorVerifyUser, validatorDataUser, validatorCompany}