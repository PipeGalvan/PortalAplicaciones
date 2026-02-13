import { getEnvironments, saveEnvironment, deleteEnvironment, getProjects } from '../middlewares/fileHandler.js';

export const getAllEnvironments = async (req, res) => {
  try {
    const environments = await getEnvironments();
    res.json(environments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entornos' });
  }
};

export const getEnvironment = async (req, res) => {
  try {
    const { id } = req.params;
    const environments = await getEnvironments();
    const environment = environments.find(env => env.id === id);
    
    if (!environment) {
      return res.status(404).json({ error: 'Entorno no encontrado' });
    }
    
    res.json(environment);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entorno' });
  }
};

export const createEnvironment = async (req, res) => {
  try {
    const environment = await saveEnvironment(req.body);
    res.status(201).json(environment);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear entorno' });
  }
};

export const updateEnvironment = async (req, res) => {
  try {
    const environment = await saveEnvironment({ ...req.body, id: req.params.id });
    res.json(environment);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar entorno' });
  }
};

export const deleteEnvironmentById = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEnvironment(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar entorno' });
  }
};

export const getEnvironmentsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { showInactive = false } = req.query;
    const environments = await getEnvironments();
    const projects = await getProjects();
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    if (!project.isActive && showInactive !== 'true') {
      return res.status(400).json({ error: 'Proyecto inactivo' });
    }
    
    const filteredEnvs = environments.filter(env => 
      env.projects?.includes(projectId)
    );
    
    res.json(filteredEnvs);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener entornos del proyecto' });
  }
};

export const updateEnvironmentProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const { projects } = req.body;
    const environments = await getEnvironments();
    
    const index = environments.findIndex(env => env.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Entorno no encontrado' });
    }
    
    if (!Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un proyecto' });
    }
    
    environments[index] = {
      ...environments[index],
      projects,
      updatedAt: new Date().toISOString()
    };
    
    await saveEnvironment(environments[index]);
    res.json(environments[index]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proyectos del entorno' });
  }
};

export const getEnvironmentProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const environments = await getEnvironments();
    const projects = await getProjects();
    
    const environment = environments.find(env => env.id === id);
    if (!environment) {
      return res.status(404).json({ error: 'Entorno no encontrado' });
    }
    
    const envProjects = projects.filter(p => 
      environment.projects?.includes(p.id)
    );
    
    res.json(envProjects);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos del entorno' });
  }
};
