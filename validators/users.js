const {check} = require("express-validator");
const validateResults = require("../utils/handleValidator")
const validatorCreateItem = [
    check ("name").exists().notEmpty(),
    check ("age").exists().notEmpty(),
    validateResults
]

module.exports = {validatorCreateItem}