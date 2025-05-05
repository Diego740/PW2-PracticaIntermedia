const express = require('express');
const { createClient, getAllClients, getClientById, updateClient, deleteClient, restoreClient } = require('../controllers/clientController');
const {authMiddleware} = require('../middleware/authMiddleware');
const { validatorCreateClient, validatorUpdateClient } = require('../validators/clientValidator');

const clientRouter = express.Router();


/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Endpoints para la gestión de clientes
 */

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clients]
 *     description: Permite crear un nuevo cliente. Se requiere la autenticación del usuario.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Cliente A"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "Calle Mayor"
 *                   number:
 *                     type: integer
 *                     example: 10
 *                   postal:
 *                     type: integer
 *                     example: 28001
 *                   city:
 *                     type: string
 *                     example: "Madrid"
 *                   province:
 *                     type: string
 *                     example: "Madrid"
 *               email:
 *                 type: string
 *                 example: "cliente@empresa.com"
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente.
 *       400:
 *         description: El cliente ya existe o los datos son inválidos.
 *       401:
 *         description: No autorizado. Se requiere un token válido.
 */
clientRouter.post('/', authMiddleware, validatorCreateClient, createClient);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clients]
 *     description: Obtiene todos los clientes del usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes.
 *       401:
 *         description: No autorizado. Se requiere un token válido.
 */
clientRouter.get('/', authMiddleware, getAllClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Obtener un cliente por su ID
 *     tags: [Clients]
 *     description: Obtiene un cliente específico por su ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a obtener.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado.
 *       404:
 *         description: Cliente no encontrado.
 *       401:
 *         description: No autorizado. Se requiere un token válido.
 */
clientRouter.get('/:id', authMiddleware, getClientById);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clients]
 *     description: Actualiza los datos de un cliente por su ID. Se requiere la autenticación del usuario.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a actualizar.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Cliente A Actualizado"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "Calle Actualizada"
 *                   number:
 *                     type: integer
 *                     example: 15
 *                   postal:
 *                     type: integer
 *                     example: 28002
 *                   city:
 *                     type: string
 *                     example: "Madrid"
 *                   province:
 *                     type: string
 *                     example: "Madrid"
 *               email:
 *                 type: string
 *                 example: "cliente_actualizado@empresa.com"
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente.
 *       400:
 *         description: Los datos proporcionados son inválidos.
 *       404:
 *         description: Cliente no encontrado.
 *       401:
 *         description: No autorizado. Se requiere un token válido.
 */
clientRouter.put('/:id', authMiddleware, validatorUpdateClient, updateClient);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Eliminar un cliente (soft delete o hard delete)
 *     tags: [Clients]
 *     description: Elimina un cliente de forma lógica (soft delete) o física (hard delete) según el parámetro "soft".
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a eliminar.
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         required: false
 *         description: Si es "false" realiza un hard delete, si no, realiza un soft delete.
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           default: "true"
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente (según el tipo de eliminación).
 *       404:
 *         description: Cliente no encontrado.
 *       401:
 *         description: No autorizado. Se requiere un token válido.
 */
clientRouter.delete('/:id', authMiddleware, deleteClient); // Soft delete y hard delete con query

/**
 * @swagger
 * /clients/restore/{id}:
 *   patch:
 *     summary: Restaurar un cliente eliminado
 *     tags: [Clients]
 *     description: Permite restaurar un cliente previamente eliminado (soft delete).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a restaurar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente restaurado correctamente.
 *       404:
 *         description: Cliente no encontrado o no eliminado.
 *       401:
 *         description: No autorizado. Se requiere un token válido.
 */
clientRouter.patch('/restore/:id', authMiddleware, restoreClient);

module.exports = clientRouter;
