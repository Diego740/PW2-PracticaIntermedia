const { check } = require('express-validator');
const validateResults = require('../utils/handleValidator');

//CREATE
const validatorCreateClient = [
  check('name')
    .exists().withMessage('El nombre es obligatorio')
    .notEmpty().withMessage('El nombre no puede estar vacío'),
  check('address')
    .exists().withMessage('La dirección es obligatoria')
    .notEmpty().withMessage('La dirección no puede estar vacía'),
  check('email')
    .exists().withMessage('El correo es obligatorio')
    .notEmpty().withMessage('El correo no puede estar vacío')
    .isEmail().withMessage('Debe ser un email válido'),
  validateResults,
];

//UPDATE
const validatorUpdateClient = [
  check('name')
    .optional()
    .notEmpty().withMessage('El nombre no puede estar vacío'),
  check('address')
    .optional()
    .notEmpty().withMessage('La dirección no puede estar vacía'),
  check('email')
    .optional()
    .isEmail().withMessage('Debe ser un email válido'),
  validateResults,
];

module.exports = { validatorCreateClient, validatorUpdateClient };
