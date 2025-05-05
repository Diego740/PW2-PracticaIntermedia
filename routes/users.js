const express = require("express");
const {
    createItem,
    validateUser,
    checkLogUser,
    addDataUser,
    addCompanyData,
    getUser,
    deleteUser,
    inviteUser
} = require("../controllers/users.js");

const {
    updateImage
} = require("../controllers/storage.js");

const {
    validatorCreateItem,
    validatorVerifyUser,
    validatorDataUser,
    validatorCompany,
    validatorInvite

} = require("../validators/users.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");
const { uploadMiddlewareMemory } = require("../middleware/uploadMiddleware.js");
//const customHeader = require("../midldleware/customHeaders.js")

const userRouter = express.Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     description: Crea un nuevo usuario con validaciones de email y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 *       409:
 *         description: El email ya está en uso.
 *       500:
 *         description: Error interno al crear el usuario.
 */

userRouter.post("/register", validatorCreateItem, createItem);

/**
 * @swagger
 * /users/validate:
 *   put:
 *     summary: Validar usuario con código de verificación
 *     tags: [Users]
 *     description: Permite validar el código de verificación para completar el registro del usuario.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verificado exitosamente.
 *       400:
 *         description: El código es incorrecto o intentos fallidos restantes.
 *       403:
 *         description: El usuario ha sido eliminado por demasiados intentos fallidos.
 *       500:
 *         description: Error interno al validar el usuario.
 */

userRouter.put("/validate", validatorVerifyUser, authMiddleware, validateUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Iniciar sesión de un usuario
 *     tags: [Users]
 *     description: Permite que un usuario se loguee con su email y contraseña, generando un token JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juan@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token JWT.
 *       401:
 *         description: Contraseña incorrecta o usuario no verificado.
 *       500:
 *         description: Error interno al iniciar sesión.
 */
userRouter.post("/login", validatorCreateItem, checkLogUser);


/**
 * @swagger
 * /users/register:
 *   put:
 *     summary: Actualizar los datos del usuario
 *     tags: [Users]
 *     description: Permite actualizar el nombre, apellidos, NIF y email del usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, surnames, nif]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan"
 *               surnames:
 *                 type: string
 *                 example: "Pérez"
 *               nif:
 *                 type: string
 *                 example: "12345678A"
 *     responses:
 *       200:
 *         description: Datos actualizados correctamente.
 *       400:
 *         description: Los datos no son válidos.
 *       500:
 *         description: Error interno al actualizar los datos.
 */

userRouter.put("/register", validatorDataUser, authMiddleware, addDataUser);

/**
 * @swagger
 * /users/company:
 *   put:
 *     summary: Agregar datos de la empresa del usuario
 *     tags: [Users]
 *     description: Permite agregar o actualizar los datos de la empresa del usuario.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company]
 *             properties:
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Mi empresa"
 *                   cif:
 *                     type: string
 *                     example: "A12345678"
 *                   street:
 *                     type: string
 *                     example: "Calle Ficticia"
 *                   number:
 *                     type: number
 *                     example: 10
 *                   postal:
 *                     type: number
 *                     example: 28001
 *                   city:
 *                     type: string
 *                     example: "Madrid"
 *                   province:
 *                     type: string
 *                     example: "Madrid"
 *     responses:
 *       200:
 *         description: Datos de la empresa actualizados correctamente.
 *       409:
 *         description: El CIF ya está registrado con otro usuario.
 *       500:
 *         description: Error interno al agregar los datos de la empresa.
 */

userRouter.put("/company", validatorCompany, authMiddleware, addCompanyData);


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener los datos del usuario autenticado
 *     tags: [Users]
 *     description: Devuelve los datos del usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario encontrados exitosamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno al obtener los datos.
 */

userRouter.get("/", authMiddleware, getUser);


/**
 * @swagger
 * /users:
 *   delete:
 *     summary: Eliminar el usuario
 *     tags: [Users]
 *     description: Elimina al usuario autenticado de la base de datos (soft o hard delete).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: soft
 *         required: false
 *         schema:
 *           type: string
 *           example: "true"
 *         description: Si es "false", realiza una eliminación permanente (hard delete).
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno al eliminar el usuario.
 */

userRouter.delete("/", authMiddleware, deleteUser);


/**
 * @swagger
 * /users/logo:
 *   patch:
 *     summary: Actualizar el logo del usuario
 *     tags: [Users]
 *     description: Permite al usuario subir una nueva imagen para su logo (imagen de perfil). La imagen se sube a Pinata y el URL es guardado en la base de datos.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del logo (máximo 5MB)
 *     responses:
 *       200:
 *         description: Logo actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logo actualizado correctamente"
 *                 url:
 *                   type: string
 *                   example: "https://gateway.pinata.cloud/ipfs/QmX7uN5JkCfs6dZvQ5iQ2O1YP34t4ivkvbEHGbxayXXBh2"
 *       400:
 *         description: No se ha subido ninguna imagen o la imagen excede el tamaño permitido de 5MB.
 *       401:
 *         description: No autorizado, se requiere un token JWT válido.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno al actualizar el logo.
 */

userRouter.patch("/logo",authMiddleware, uploadMiddlewareMemory.single("image"), updateImage);


/**
 * @swagger
 * /users/invite:
 *   post:
 *     summary: Invitar a un nuevo usuario
 *     tags: [Users]
 *     description: Envía una invitación a un nuevo usuario, generando una cuenta de invitado.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "newuser@example.com"
 *     responses:
 *       200:
 *         description: Invitación enviada exitosamente.
 *       409:
 *         description: El usuario ya tiene una cuenta registrada.
 *       500:
 *         description: Error interno al invitar al usuario.
 */

userRouter.post("/invite", authMiddleware, validatorInvite, inviteUser)

module.exports = userRouter;
