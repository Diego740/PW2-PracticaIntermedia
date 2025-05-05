const { check } = require("express-validator");
const Project = require("../models/projects");
const Client = require("../models/clients");
const validateResults = require("../utils/handleValidator");

const validatorCreateAlbaran = [
    check("clientId")
        .exists()
        .withMessage("El ID del cliente es obligatorio")
        .isMongoId()
        .withMessage("El ID del cliente debe ser un ObjectId válido"),

    check("projectId")
        .exists()
        .withMessage("El ID del proyecto es obligatorio")
        .isMongoId()
        .withMessage("El ID del proyecto debe ser un ObjectId válido")
        .custom(async (value, { req }) => {
            
            const project = await Project.findById(value);
            if (!project) {
                throw new Error("Proyecto no encontrado");
            }

            if (project.clientId.toString() !== req.body.clientId) {
                throw new Error(
                    "El proyecto no pertenece al cliente proporcionado"
                );
            }
            return true;
        }),

    check("format")
        .exists()
        .withMessage("El formato es obligatorio")
        .isIn(["hours", "materials"])
        .withMessage('El formato debe ser "hours" o "materials"'),

    check("description")
        .exists()
        .withMessage("La descripción es obligatoria")
        .notEmpty()
        .withMessage("La descripción no puede estar vacía"),

    check("hours")
        .optional()
        .isNumeric()
        .withMessage("Las horas deben ser un número"),

    check("material")
        .optional()
        .notEmpty()
        .withMessage("El material no puede estar vacío"),

    validateResults,
];

module.exports = { validatorCreateAlbaran };
