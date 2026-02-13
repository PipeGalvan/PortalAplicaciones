import express from 'express';
import * as environmentsController from '../controllers/environments.js';
import * as projectsController from '../controllers/projects.js';
import * as healthController from '../controllers/health.js';

const router = express.Router();

// Projects
router.get('/projects', projectsController.getAllProjects);
router.get('/projects/:id', projectsController.getProject);
router.post('/projects', projectsController.createProject);
router.put('/projects/:id', projectsController.updateProject);
router.delete('/projects/:id', projectsController.deleteProjectById);
router.put('/projects/:id/toggle', projectsController.toggleProject);

// Environments
router.get('/environments', environmentsController.getAllEnvironments);
router.get('/environments/:id', environmentsController.getEnvironment);
router.get('/environments/:id/projects', environmentsController.getEnvironmentProjects);
router.post('/environments', environmentsController.createEnvironment);
router.put('/environments/:id', environmentsController.updateEnvironment);
router.put('/environments/:id/projects', environmentsController.updateEnvironmentProjects);
router.delete('/environments/:id', environmentsController.deleteEnvironmentById);
router.get('/projects/:projectId/environments', environmentsController.getEnvironmentsByProject);

// Health
router.post('/health/check', healthController.checkHealth);

export default router;
