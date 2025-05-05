const express = require('express');
const { 
  createDeliveryNote, 
  getAllDeliveryNotes, 
  getDeliveryNoteById, 
  generatePDF, 
  signDeliveryNote, 
  deleteDeliveryNote 
} = require('../controllers/deliveryNoteController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validatorCreateAlbaran } = require('../validators/deliveryNoteValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: DeliveryNotes
 *   description: Endpoints para la gestión de albaranes
 */

/**
 * @swagger
 * /deliverynotes:
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [DeliveryNotes]
 *     description: Crea un albarán asociado a un proyecto y cliente, con horas o materiales.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, clientId, format, description]
 *             properties:
 *               projectId:
 *                 type: string
 *                 example: "681870615684159e11db8b63"
 *               clientId:
 *                 type: string
 *                 example: "6817a381c097c3812708113d"
 *               format:
 *                 type: string
 *                 enum: ["hours", "materials"]
 *                 example: "hours"
 *               material:
 *                 type: string
 *                 example: "Cemento"
 *               hours:
 *                 type: integer
 *                 example: 10
 *               description:
 *                 type: string
 *                 example: "Trabajo realizado en el proyecto X"
 *     responses:
 *       201:
 *         description: Albarán creado exitosamente.
 *       400:
 *         description: Datos de entrada inválidos o falta información.
 *       500:
 *         description: Error al crear el albarán.
 */
router.post('/', authMiddleware, validatorCreateAlbaran, createDeliveryNote);
/**
 * @swagger
 * /deliverynotes:
 *   get:
 *     summary: Obtener todos los albaranes del usuario
 *     tags: [DeliveryNotes]
 *     description: Devuelve todos los albaranes creados por el usuario autenticado.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "6818dd5350eb18ba445a2600"
 *                   projectId:
 *                     type: string
 *                     example: "681870615684159e11db8b63"
 *                   clientId:
 *                     type: string
 *                     example: "6817a381c097c3812708113d"
 *                   description:
 *                     type: string
 *                     example: "Trabajo realizado en el proyecto X"
 *                   createdAt:
 *                     type: string
 *                     example: "2024-06-07T07:26:32.121Z"
 *       500:
 *         description: Error al obtener los albaranes.
 */

router.get('/', authMiddleware, getAllDeliveryNotes);

/**
 * @swagger
 * /deliverynotes/{id}:
 *   get:
 *     summary: Obtener un albarán por su ID
 *     tags: [DeliveryNotes]
 *     description: Devuelve un albarán específico con su información completa.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6818dd5350eb18ba445a2600"
 *         description: ID del albarán
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Albarán encontrado exitosamente.
 *       404:
 *         description: Albarán no encontrado.
 *       500:
 *         description: Error al obtener el albarán.
 */

router.get('/:id', authMiddleware, getDeliveryNoteById);

/**
 * @swagger
 * /deliverynotes/{id}/pdf:
 *   get:
 *     summary: Descargar el albarán en formato PDF
 *     tags: [DeliveryNotes]
 *     description: Genera y descarga el PDF del albarán.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6818dd5350eb18ba445a2600"
 *         description: ID del albarán
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: PDF del albarán generado exitosamente.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Albarán no encontrado.
 *       500:
 *         description: Error al generar el PDF.
 */

router.get('/pdf/:id', authMiddleware, generatePDF);
/**
 * @swagger
 * /deliverynotes/sign:
 *   post:
 *     summary: Firmar un albarán
 *     tags: [DeliveryNotes]
 *     description: Permite subir una firma y un PDF generado de un albarán.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deliveryNoteId, signatureImageBuffer, signatureImageName]
 *             properties:
 *               deliveryNoteId:
 *                 type: string
 *                 example: "6818dd5350eb18ba445a2600"
 *               signatureImageBuffer:
 *                 type: string
 *                 format: base64
 *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *               signatureImageName:
 *                 type: string
 *                 example: "firma.png"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente.
 *       400:
 *         description: Error en la firma o en el albarán.
 *       500:
 *         description: Error al firmar el albarán.
 */

router.post('/sign', authMiddleware, signDeliveryNote);
/**
 * @swagger
 * /deliverynotes/{id}:
 *   delete:
 *     summary: Eliminar un albarán
 *     tags: [DeliveryNotes]
 *     description: Elimina un albarán de forma permanente o archivada (soft delete).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "6818dd5350eb18ba445a2600"
 *         description: ID del albarán
 *       - in: query
 *         name: soft
 *         required: false
 *         schema:
 *           type: boolean
 *           example: true
 *         description: Si es `false`, realiza un hard delete (eliminación permanente).
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Albarán eliminado correctamente.
 *       400:
 *         description: No se puede eliminar un albarán firmado.
 *       404:
 *         description: Albarán no encontrado.
 *       500:
 *         description: Error al eliminar el albarán.
 */

router.delete('/:id', authMiddleware, deleteDeliveryNote);

module.exports = router;
