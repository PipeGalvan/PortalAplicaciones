import {
  getProjects,
  getProjectById,
  saveProject,
  deleteProject,
  toggleProjectStatus
} from '../middlewares/fileHandler.js';

export const getAllProjects = async (req, res) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

export const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
};

export const createProject = async (req, res) => {
  try {
    const modifiedBy = req.headers['x-user'] || 'system';
    const project = await saveProject(req.body, modifiedBy);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const modifiedBy = req.headers['x-user'] || 'system';
    const project = await saveProject({ ...req.body, id: req.params.id }, modifiedBy);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
};

export const deleteProjectById = async (req, res) => {
  try {
    const modifiedBy = req.headers['x-user'] || 'system';
    const { id } = req.params;
    const project = await deleteProject(id, modifiedBy);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
};

export const toggleProject = async (req, res) => {
  try {
    const modifiedBy = req.headers['x-user'] || 'system';
    const { id } = req.params;
    const project = await toggleProjectStatus(id, modifiedBy);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado del proyecto' });
  }
};
