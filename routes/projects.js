const express = require('express');
const { createProject, getAllProjects, getProjectById, updateProject, deleteProject, restoreProject } = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validatorCreateProject, validatorUpdateProject } = require('../validators/projectValidator');

const router = express.Router();

router.post('/', authMiddleware, validatorCreateProject, createProject);
router.get('/', authMiddleware, getAllProjects);
router.get('/:id', authMiddleware, getProjectById);
router.put('/:id', authMiddleware, validatorUpdateProject, updateProject);
router.delete('/:id', authMiddleware, deleteProject); //Soft delete y hard delete
router.patch('/restore/:id', authMiddleware, restoreProject); 

module.exports = router;
