const Project = require('../models/projects');
const { handleHttpError } = require('../utils/handleError');
const { matchedData } = require('express-validator');


const createProject = async (req, res) => {
  try {
    const body = matchedData(req);
    const { name, projectCode, code, address, begin, end, notes, clientId } = body;
    //console.log(body)


    const existingProject = await Project.findOne({ projectCode, userId: req.user.id });
    if (existingProject) {
      return res.status(400).json({ message: 'El proyecto ya existe.' });
    }


    const newProject = new Project({ name, projectCode, code, address, userId: req.user.id, clientId, begin, end, notes });
    await newProject.save();

    res.status(201).json({ data: newProject });
  } catch (error) {

    handleHttpError(res, "ERROR_CREATING_PROJECT", 500);
  }
};


const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.status(200).json({ data: projects });
  } catch (error) {
    handleHttpError(res, "ERROR_GETTING_PROJECTS", 500);
  }
};


const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    res.status(200).json({ data: project });
  } catch (error) {
    handleHttpError(res, "ERROR_GETTING_PROJECT", 500);
  }
};


const updateProject = async (req, res) => {
  try {
    const body = matchedData(req);
    const { name, projectCode, code, address, begin, end, notes, clientId } = body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id},
      { name, projectCode, code, address, begin, end, notes, clientId },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.status(200).json({ data: project });
  } catch (error) {
    handleHttpError(res, "ERROR_UPDATING_PROJECT", 500);
  }
};


const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const softDelete = req.query.soft !== "false";

    const project = await Project.findOne({ _id: projectId, userId });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (softDelete) {
      await Project.delete({ _id: projectId, userId });
      return res.status(200).json({ message: "Proyecto archivado correctamente" });
    } else {
      // Hard delete: Eliminar físicamente el proyecto
      await Project.deleteOne({ _id: projectId, userId });
      return res.status(200).json({ message: "Proyecto eliminado permanentemente" });
    }

  } catch (err) {
    console.error(err);
    handleHttpError(res, "ERROR_DELETING_PROJECT", 500);
  }
};


const restoreProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const project = await Project.restore({ _id: projectId, userId, deleted: true });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado o no eliminado' });
    }

    res.status(200).json({ message: "Proyecto restaurado correctamente" });
  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_RESTORING_PROJECT", 500);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  restoreProject,
};
