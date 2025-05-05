const { check, validationResult } = require("express-validator");
const moment = require("moment"); //MANIPULAR Y COMPARAR FECHAS
const validateResults = require("../utils/handleValidator");
const Client = require('../models/clients');


//CREATE
const validatorCreateProject = [
    check("name")
        .exists()
        .withMessage("El nombre del proyecto es obligatorio")
        .notEmpty()
        .withMessage("El nombre no puede estar vacío"),

    check("projectCode")
        .exists()
        .withMessage("El código del proyecto es obligatorio")
        .notEmpty()
        .withMessage("El código no puede estar vacío"),

    check("code")
        .exists()
        .withMessage("El código del proyecto es obligatorio")
        .notEmpty()
        .withMessage("El código no puede estar vacío"),

    check("address")
        .exists()
        .withMessage("La dirección es obligatoria")
        .isObject()
        .withMessage("La dirección debe ser un objeto")
        .custom((value) => {
            if (
                !value.street ||
                !value.number ||
                !value.postal ||
                !value.city ||
                !value.province
            ) {
                throw new Error(
                    "La dirección debe contener todos los campos necesarios (calle, número, código postal, ciudad, provincia)"
                );
            }
            return true;
        }),

    check("begin")
        .exists()
        .withMessage("La fecha de inicio es obligatoria")
        .custom((value) => {
            if (!moment(value, "DD-MM-YYYY", true).isValid()) {
                throw new Error("La fecha de inicio no es válida");
            }
            return true;
        }),

    check("end")
        .exists()
        .withMessage("La fecha de finalización es obligatoria")
        .custom((value) => {
            if (!moment(value, "DD-MM-YYYY", true).isValid()) {
                throw new Error("La fecha de finalización no es válida");
            }
            return true;
        }),

    check("begin").custom((value, { req }) => {
        const beginDate = moment(value, "DD-MM-YYYY");
        const endDate = moment(req.body.end, "DD-MM-YYYY");
        if (beginDate.isAfter(endDate)) {
            throw new Error(
                "La fecha de inicio debe ser anterior a la de finalización"
            );
        }
        return true;
    }),

    check("notes")
        .exists()
        .withMessage("Las notas del proyecto son obligatorias")
        .notEmpty()
        .withMessage("Las notas no pueden estar vacías"),

    check("clientId")
        .exists()
        .withMessage("El ID del cliente es obligatorio")
        .notEmpty()
        .withMessage("El ID del cliente no puede estar vacío")
        .isMongoId()
        .withMessage("El ID del cliente debe ser un ObjectId válido")
        .custom(async (value) => {
            const client = await Client.findById(value); // Verifica si el cliente existe en la base de datos
            if (!client) {
                throw new Error("El cliente con este ID no existe");
            }
            return true;
        }),

    validateResults,
];

//UPDATE
const validatorUpdateProject = [
    check("name")
        .optional()
        .notEmpty()
        .withMessage("El nombre no puede estar vacío"),

    check("projectCode")
        .optional()
        .notEmpty()
        .withMessage("El código no puede estar vacío"),

    check("code")
        .optional()
        .notEmpty()
        .withMessage("El código no puede estar vacío"),

    check("address")
        .optional()
        .isObject()
        .withMessage("La dirección debe ser un objeto"),

    check("begin")
        .optional()
        .custom((value) => {
            if (!moment(value, "DD-MM-YYYY", true).isValid()) {
                throw new Error("La fecha de inicio no es válida");
            }
            return true;
        }),

    check("end")
        .optional()
        .custom((value) => {
            if (!moment(value, "DD-MM-YYYY", true).isValid()) {
                throw new Error("La fecha de finalización no es válida");
            }
            return true;
        }),

    check("begin")
        .optional()
        .custom((value, { req }) => {
            const beginDate = moment(value, "DD-MM-YYYY");
            const endDate = moment(req.body.end, "DD-MM-YYYY");
            if (beginDate.isAfter(endDate)) {
                throw new Error(
                    "La fecha de inicio debe ser anterior a la de finalización"
                );
            }
            return true;
        }),

    check("notes")
        .optional()
        .notEmpty()
        .withMessage("Las notas no pueden estar vacías"),

    check("clientId")
        .optional()
        .isMongoId()
        .withMessage("El ID del cliente debe ser un ObjectId válido")
        .custom(async (value) => {
            if (value) {
                const client = await Client.findById(value);
                if (!client) {
                    throw new Error("El cliente con este ID no existe");
                }
            }
            return true;
        }),

    validateResults,
];

module.exports = { validatorCreateProject, validatorUpdateProject };
