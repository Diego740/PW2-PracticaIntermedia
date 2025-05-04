const Client = require('../models/clients');
const { handleHttpError } = require('../utils/handleError');
const { matchedData } = require('express-validator');


const createClient = async (req, res) => {
  try {
    const body = matchedData(req);
    const { name, address, email } = body;


    const existingClient = await Client.findOne({ email, user: req.user.id });
    if (existingClient) {
      return res.status(400).json({ message: 'El cliente ya existe.' });
    }


    const newClient = new Client({ name, address, email, user: req.user.id });
    await newClient.save();

    res.status(201).json({ data: newClient });
  } catch (error) {
    handleHttpError(res, "ERROR_CREATING_CLIENT", 500)
  }
};


const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find({ user: req.user.id });
    res.status(200).json({ data: clients });
  } catch (error) {
    handleHttpError(res, "ERROR_GETTING_CLIENT", 500)
  } 
};


const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, user: req.user.id });
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.status(200).json({ data: client });
  } catch (error) {
    handleHttpError(res, "ERROR_GETTING_CLIENT", 500)
  }
};


const updateClient = async (req, res) => {
  try {
    const body = matchedData(req);
    const { name, address, email } = body;

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id},
      { name, address, email },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json({ data: client });
  } catch (error) {
    handleHttpError(res, "ERROR_UPDATING_CLIENT", 500)
  }
};

const deleteClient = async (req, res) => {
    try {
        const clientId = req.params.id;
        const userId = req.user.id;
        const softDelete = req.query.soft !== "false";

        const client = await Client.findOne({ _id: clientId, user: userId });

        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        if (softDelete) {
            await Client.delete({ _id: clientId, user: userId });
            return res.status(200).json({ message: "Cliente archivado correctamente" });
        } else {
            // Hard delete: Eliminar físicamente el cliente de la base de datos
            await Client.deleteOne({ _id: clientId, user: userId });
            return res.status(200).json({ message: "Cliente eliminado permanentemente" });
        }

    } catch (err) {
        console.error(err);
        handleError(res, "ERROR_DELETING_CLIENT", 500);
    }
};

const restoreClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const userId = req.user.id;
    
    try {
      const client = await Client.restore({ _id: clientId, user: userId, deleted: true });
    } catch (error) {
      //console.log(error)
      return res.status(400).json({ message: 'Cliente no encontrado o no eliminado' });
    }
    const client = await Client.findOne({ _id: clientId, user: userId });
    if(!client){
      return res.status(404).json({ message: 'Cliente no encontrado o no eliminado' });
    }
  

    res.status(200).json({ message: "Cliente restaurado correctamente" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_RESTORING_CLIENT", 500);
  }
};



module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  restoreClient
};
