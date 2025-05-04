const express = require('express');
const { createClient, getAllClients, getClientById, updateClient, deleteClient, restoreClient } = require('../controllers/clientController');
const {authMiddleware} = require('../middleware/authMiddleware');
const { validatorCreateClient, validatorUpdateClient } = require('../validators/clientValidator');

const clientRouter = express.Router();

clientRouter.post('/', authMiddleware, validatorCreateClient, createClient);
clientRouter.get('/', authMiddleware, getAllClients);
clientRouter.get('/:id', authMiddleware, getClientById);
clientRouter.put('/:id', authMiddleware, validatorUpdateClient, updateClient);
clientRouter.delete('/:id', authMiddleware, deleteClient); // Soft delete y hard delete con query
clientRouter.patch('/restore/:id', authMiddleware, restoreClient);

module.exports = clientRouter;
