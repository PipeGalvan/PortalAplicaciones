import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'config', 'data.json');

export async function readData() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      projects: parsed.projects || [],
      environments: parsed.environments || []
    };
  } catch (error) {
    return { projects: [], environments: [] };
  }
}

export async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getEnvironments() {
  const data = await readData();
  return data.environments || [];
}

export async function saveEnvironment(environment) {
  const data = await readData();
  
  if (environment.id) {
    const index = data.environments.findIndex(env => env.id === environment.id);
    if (index !== -1) {
      data.environments[index] = { ...data.environments[index], ...environment, updatedAt: new Date().toISOString() };
    }
  } else {
    const newEnvironment = {
      id: generateId(),
      ...environment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.environments.push(newEnvironment);
  }
  
  await writeData(data);
  return environment.id ? environment : data.environments[data.environments.length - 1];
}

export async function deleteEnvironment(id) {
  const data = await readData();
  data.environments = data.environments.filter(env => env.id !== id);
  await writeData(data);
}

export async function getProjects() {
  const data = await readData();
  return data.projects || [];
}

export async function getProjectById(id) {
  const projects = await getProjects();
  return projects.find(p => p.id === id);
}

export async function saveProject(project, modifiedBy) {
  const data = await readData();
  const now = new Date().toISOString();
  
  if (project.id) {
    const index = data.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      const existingProject = data.projects[index];
      data.projects[index] = {
        ...existingProject,
        ...project,
        updatedAt: now,
        history: [
          ...(existingProject.history || []),
          {
            action: 'updated',
            modifiedBy,
            modifiedAt: now,
            changes: getChanges(existingProject, project)
          }
        ]
      };
    }
  } else {
    const newProject = {
      id: generateId(),
      name: project.name,
      description: project.description,
      color: project.color,
      team: project.team,
      isActive: project.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          action: 'created',
          modifiedBy,
          modifiedAt: now
        }
      ]
    };
    data.projects.push(newProject);
  }
  
  await writeData(data);
  return project.id ? project : data.projects[data.projects.length - 1];
}

export async function deleteProject(id, modifiedBy) {
  const data = await readData();
  const now = new Date().toISOString();
  
  const project = data.projects.find(p => p.id === id);
  if (!project) return null;
  
  data.projects = data.projects.filter(p => p.id !== id);
  
  data.environments = data.environments.map(env => ({
    ...env,
    projects: env.projects?.filter(pId => pId !== id) || [],
    updatedAt: now
  }));
  
  await writeData(data);
  return project;
}

export async function toggleProjectStatus(id, modifiedBy) {
  const data = await readData();
  const now = new Date().toISOString();
  
  const index = data.projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const project = data.projects[index];
  data.projects[index] = {
    ...project,
    isActive: !project.isActive,
    updatedAt: now,
    history: [
      ...(project.history || []),
      {
        action: project.isActive ? 'deactivated' : 'activated',
        modifiedBy,
        modifiedAt: now
      }
    ]
  };
  
  await writeData(data);
  return data.projects[index];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getChanges(oldObj, newObj) {
  const changes = [];
  const fields = ['name', 'description', 'color', 'team', 'isActive'];
  
  fields.forEach(field => {
    if (oldObj[field] !== newObj[field]) {
      changes.push({
        field,
        oldValue: oldObj[field],
        newValue: newObj[field]
      });
    }
  });
  
  return changes;
}
