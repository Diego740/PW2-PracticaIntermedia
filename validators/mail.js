const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorMail = [
  check("subject").exists().notEmpty(),
  check("text").exists().notEmpty(),
  check("to").exists().notEmpty(),
  check("from").exists().notEmpty(),
  validateResults
];

module.exports = { validatorMail };
