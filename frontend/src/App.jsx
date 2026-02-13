import { useState, useEffect } from 'react';
import { Plus, RefreshCw, X, Clock, Edit2, Trash2 } from 'lucide-react';
import { FavoritesProvider } from './context/FavoritesContext';
import { SearchBar } from './components/SearchBar/SearchBar';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { EnvironmentList } from './components/EnvironmentList/EnvironmentList';
import { EnvironmentForm } from './components/EnvironmentForm/EnvironmentForm';
import { ProjectForm } from './components/ProjectForm/ProjectForm';
import { ProjectSidebar } from './components/ProjectSidebar/ProjectSidebar';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { environmentsAPI, projectsAPI, healthAPI } from './services/api';

function App() {
  const [environments, setEnvironments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'Todos',
    type: 'Todos',
    project: null,
    favoritesOnly: false
  });
  const [viewMode, setViewMode] = useState('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingEnvironment, setEditingEnvironment] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProject, setHistoryProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInactiveProjects, setShowInactiveProjects] = useState(false);
  const [healthResults, setHealthResults] = useState({});
  const [isLoadingHealth, setIsLoadingHealth] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [envsResponse, projsResponse] = await Promise.all([
        environmentsAPI.getAll(),
        projectsAPI.getAll()
      ]);
      setEnvironments(envsResponse.data);
      setProjects(projsResponse.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnvironment = () => {
    setEditingEnvironment(null);
    setShowForm(true);
  };

  const handleEditEnvironment = (environment) => {
    setEditingEnvironment(environment);
    setShowForm(true);
  };

  const handleDeleteEnvironment = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este entorno?')) return;
    
    try {
      await environmentsAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error al eliminar entorno:', error);
      alert('Error al eliminar el entorno');
    }
  };

  const handleSaveEnvironment = async (data) => {
    try {
      if (editingEnvironment) {
        await environmentsAPI.update(editingEnvironment.id, data);
      } else {
        await environmentsAPI.create(data);
      }
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error('Error al guardar entorno:', error);
      alert('Error al guardar el entorno');
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = async (id) => {
    const project = projects.find(p => p.id === id);
    const envCount = environments.filter(env => env.projects?.includes(id)).length;
    
    if (!confirm(`¿Eliminar el proyecto "${project.name}"?\n\nLos ${envCount} entornos asociados se mantendrán, pero perderán la relación con este proyecto.`)) {
      return;
    }
    
    try {
      await projectsAPI.delete(id);
      if (selectedProject === id) {
        setSelectedProject(null);
        setFilters(prev => ({ ...prev, project: null }));
      }
      await loadData();
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      alert('Error al eliminar el proyecto');
    }
  };

  const handleToggleProject = async (id) => {
    try {
      await projectsAPI.toggle(id);
      await loadData();
    } catch (error) {
      console.error('Error al cambiar estado del proyecto:', error);
      alert('Error al cambiar estado del proyecto');
    }
  };

  const handleSaveProject = async (data) => {
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, data);
      } else {
        await projectsAPI.create(data);
      }
      setShowProjectForm(false);
      await loadData();
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      alert('Error al guardar el proyecto');
    }
  };

  const handleViewHistory = (project) => {
    setHistoryProject(project);
    setShowHistoryModal(true);
  };

  const handleHealthCheck = async (environment) => {
    try {
      setIsLoadingHealth(environment.id);
      const response = await healthAPI.check({
        type: environment.type,
        url: environment.url,
        port: environment.port,
        httpMethod: environment.httpMethod || 'HEAD'
      });
      setHealthResults(prev => ({
        ...prev,
        [environment.id]: response.data
      }));
    } catch (error) {
      console.error('Error al verificar estado:', error);
      setHealthResults(prev => ({
        ...prev,
        [environment.id]: { status: 'error', error: 'Error al verificar' }
      }));
    } finally {
      setIsLoadingHealth(null);
    }
  };

  const handleFilterByProject = (projectId) => {
    setSelectedProject(projectId);
    setFilters(prev => ({ ...prev, project: projectId }));
  };

  const getProjectEnvironmentCount = (projectId) => {
    return environments.filter(env => env.projects?.includes(projectId)).length;
  };

  const isFavorite = (id) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(id);
  };

  const filteredEnvironments = environments.filter((env) => {
    const matchesSearch = 
      env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.database?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filters.category === 'Todos' || env.category === filters.category;
    const matchesType = filters.type === 'Todos' || env.type === filters.type;
    const matchesProject = !filters.project || env.projects?.includes(filters.project);
    
    const project = projects.find(p => p.id === filters.project);
    const isActiveProject = !project || project.isActive || showInactiveProjects;
    
    const matchesFavorites = !filters.favoritesOnly || isFavorite(env.id);

    return matchesSearch && matchesCategory && matchesType && matchesProject && isActiveProject && matchesFavorites;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null;

  return (
    <FavoritesProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">
                    {selectedProjectData ? selectedProjectData.name : 'Portal de Aplicaciones'}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProjectData 
                      ? `${selectedProjectData.description || ''} • ${getProjectEnvironmentCount(selectedProject)} entornos`
                      : 'Gestión de entornos y conexiones'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={loadData}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Recargar"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          <ProjectSidebar
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onCreateProject={handleAddProject}
            onToggleProject={handleToggleProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onViewHistory={handleViewHistory}
            showInactive={showInactiveProjects}
            onToggleShowInactive={() => setShowInactiveProjects(!showInactiveProjects)}
            getProjectCount={getProjectEnvironmentCount}
          />

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-6">
                <aside className="lg:w-72 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Buscar</h3>
                    <SearchBar value={searchTerm} onChange={setSearchTerm} />
                  </div>
                  
                  <FilterPanel 
                    filters={filters} 
                    onFilterChange={setFilters}
                    projects={projects}
                  />
                </aside>

                <div className="flex-1">
                  <EnvironmentList
                    environments={filteredEnvironments}
                    projects={projects}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    onAdd={handleAddEnvironment}
                    onEdit={handleEditEnvironment}
                    onDelete={handleDeleteEnvironment}
                    onHealthCheck={handleHealthCheck}
                    healthResults={healthResults}
                    isLoadingHealth={isLoadingHealth}
                    onFilterByProject={handleFilterByProject}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>

        {showForm && (
          <EnvironmentForm
            environment={editingEnvironment}
            projects={projects}
            onSave={handleSaveEnvironment}
            onClose={() => setShowForm(false)}
          />
        )}

        {showProjectForm && (
          <ProjectForm
            project={editingProject}
            onSave={handleSaveProject}
            onClose={() => setShowProjectForm(false)}
          />
        )}

        {showHistoryModal && historyProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">Historial de {historyProject.name}</h2>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                {historyProject.history && historyProject.history.length > 0 ? (
                  <div className="space-y-4">
                    {historyProject.history.slice().reverse().map((entry, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium capitalize">{entry.action}</span>
                            <span className="text-sm text-gray-500">
                              por {entry.modifiedBy}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(entry.modifiedAt).toLocaleString('es-AR', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </div>
                          {entry.changes && entry.changes.length > 0 && (
                            <div className="mt-2 text-sm">
                              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Cambios:</div>
                              <ul className="list-disc list-inside space-y-1">
                                {entry.changes.map((change, idx) => (
                                  <li key={idx} className="text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">{change.field}:</span>{' '}
                                    {change.oldValue} → {change.newValue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                    No hay historial disponible
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FavoritesProvider>
  );
}

export default App;
