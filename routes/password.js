const express = require("express");
const {validatorGetToken, validatorPassword} = require ("../validators/password.js")
const { authMiddlewareReset } = require("../middleware/authMiddleware.js");
const { getResetToken, changePassword } = require("../controllers/password.js");

const userRouter = express.Router();
/**
 * @swagger
 * tags:
 *   name: Password
 *   description: Endpoints para la gestión de contraseñas de usuario.
 */

/**
 * @swagger
 * /password/getToken:
 *   post:
 *     summary: Generar un token de recuperación de contraseña
 *     tags: [Password]
 *     description: Permite generar un token de recuperación de contraseña para un usuario mediante su correo electrónico.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juan@domain.com"
 *     responses:
 *       200:
 *         description: Token de recuperación generado correctamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al generar el token de recuperación.
 */
userRouter.post("/getToken", validatorGetToken, getResetToken);


/**
 * @swagger
 * /password/changePassword:
 *   put:
 *     summary: Cambiar la contraseña del usuario
 *     tags: [Password]
 *     description: Permite cambiar la contraseña de un usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "NewSecurePassword123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error al actualizar la contraseña.
 */
userRouter.put("/changePassword", authMiddlewareReset, validatorPassword, changePassword);

module.exports = userRouter;
