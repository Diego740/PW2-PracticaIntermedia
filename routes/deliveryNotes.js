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


router.post('/', authMiddleware, validatorCreateAlbaran, createDeliveryNote);
router.get('/', authMiddleware, getAllDeliveryNotes);
router.get('/:id', authMiddleware, getDeliveryNoteById);
router.get('/pdf/:id', authMiddleware, generatePDF);
router.post('/sign', authMiddleware, signDeliveryNote);
router.delete('/:id', authMiddleware, deleteDeliveryNote);

module.exports = router;
