import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-User': 'user'
  },
});

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  toggle: (id) => api.put(`/projects/${id}/toggle`),
};

export const environmentsAPI = {
  getAll: () => api.get('/environments'),
  getById: (id) => api.get(`/environments/${id}`),
  getByProject: (projectId, showInactive = false) => 
    api.get(`/projects/${projectId}/environments`, { params: { showInactive } }),
  getProjects: (id) => api.get(`/environments/${id}/projects`),
  create: (data) => api.post('/environments', data),
  update: (id, data) => api.put(`/environments/${id}`, data),
  updateProjects: (id, projects) => api.put(`/environments/${id}/projects`, { projects }),
  delete: (id) => api.delete(`/environments/${id}`),
};

export const healthAPI = {
  check: (data) => api.post('/health/check', data),
};

export default api;
