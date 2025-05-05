const express = require('express');
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject, restoreProject } = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validatorCreateProject, validatorUpdateProject } = require('../validators/projectValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Endpoints para la gestión de proyectos.
 */

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Projects]
 *     description: Permite crear un proyecto asociado al usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - projectCode
 *               - code
 *               - address
 *               - begin
 *               - end
 *               - notes
 *               - clientId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nuevo Proyecto"
 *               projectCode:
 *                 type: string
 *                 example: "PROJ12345"
 *               code:
 *                 type: string
 *                 example: "1234"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "Calle Falsa"
 *                   number:
 *                     type: number
 *                     example: 123
 *                   postal:
 *                     type: number
 *                     example: 28001
 *                   city:
 *                     type: string
 *                     example: "Madrid"
 *                   province:
 *                     type: string
 *                     example: "Madrid"
 *               begin:
 *                 type: string
 *                 example: "2024-01-01"
 *               end:
 *                 type: string
 *                 example: "2024-12-31"
 *               notes:
 *                 type: string
 *                 example: "Proyecto de construcción"
 *               clientId:
 *                 type: string
 *                 example: "606d1f25f1e9e72c4b3c46b9"
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente.
 *       400:
 *         description: Proyecto ya existe o datos inválidos.
 *       500:
 *         description: Error en la creación del proyecto.
 */
router.post('/', authMiddleware, validatorCreateProject, createProject);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Obtener todos los proyectos del usuario
 *     tags: [Projects]
 *     description: Recupera todos los proyectos asociados al usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Nuevo Proyecto"
 *                   projectCode:
 *                     type: string
 *                     example: "PROJ12345"
 *       500:
 *         description: Error al obtener los proyectos.
 */
router.get('/', authMiddleware, getAllProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Obtener un proyecto por ID
 *     tags: [Projects]
 *     description: Recupera un proyecto específico asociado al usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto.
 *         schema:
 *           type: string
 *           example: "607f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Proyecto encontrado.
 *       404:
 *         description: Proyecto no encontrado.
 *       500:
 *         description: Error al obtener el proyecto.
 */
router.get('/:id', authMiddleware, getProjectById);


/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Actualizar un proyecto
 *     tags: [Projects]
 *     description: Actualiza los datos de un proyecto existente.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto.
 *         schema:
 *           type: string
 *           example: "607f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Proyecto actualizado"
 *               projectCode:
 *                 type: string
 *                 example: "PROJ54321"
 *               code:
 *                 type: string
 *                 example: "5678"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "Calle Actualizada"
 *                   number:
 *                     type: number
 *                     example: 456
 *                   postal:
 *                     type: number
 *                     example: 28002
 *                   city:
 *                     type: string
 *                     example: "Madrid"
 *                   province:
 *                     type: string
 *                     example: "Madrid"
 *               begin:
 *                 type: string
 *                 example: "2024-01-01"
 *               end:
 *                 type: string
 *                 example: "2024-12-31"
 *               notes:
 *                 type: string
 *                 example: "Proyecto renovado"
 *               clientId:
 *                 type: string
 *                 example: "606d1f25f1e9e72c4b3c46b9"
 *     responses:
 *       200:
 *         description: Proyecto actualizado exitosamente.
 *       400:
 *         description: Datos inválidos.
 *       404:
 *         description: Proyecto no encontrado.
 *       500:
 *         description: Error al actualizar el proyecto.
 */
router.put('/:id', authMiddleware, validatorUpdateProject, updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Eliminar un proyecto
 *     tags: [Projects]
 *     description: Elimina un proyecto de manera suave o permanente (dependiendo del parámetro `soft`).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto.
 *         schema:
 *           type: string
 *           example: "607f1f77bcf86cd799439011"
 *       - in: query
 *         name: soft
 *         description: Si se pasa `false`, se realiza un hard delete. Si no, se realiza un soft delete.
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Proyecto eliminado correctamente.
 *       404:
 *         description: Proyecto no encontrado.
 *       500:
 *         description: Error al eliminar el proyecto.
 */
router.delete('/:id', authMiddleware, deleteProject); //Soft delete y hard delete

/**
 * @swagger
 * /projects/restore/{id}:
 *   patch:
 *     summary: Restaurar un proyecto eliminado
 *     tags: [Projects]
 *     description: Permite restaurar un proyecto eliminado previamente.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto.
 *         schema:
 *           type: string
 *           example: "607f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Proyecto restaurado correctamente.
 *       404:
 *         description: Proyecto no encontrado o no eliminado.
 *       500:
 *         description: Error al restaurar el proyecto.
 */
router.patch('/restore/:id', authMiddleware, restoreProject); 

module.exports = router;
