import { Plus, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { EnvironmentCard } from '../EnvironmentCard/EnvironmentCard';

export function EnvironmentList({ 
  environments, 
  projects,
  viewMode, 
  setViewMode, 
  onAdd, 
  onEdit, 
  onDelete, 
  onHealthCheck,
  healthResults,
  isLoadingHealth,
  onFilterByProject
}) {
  if (environments.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <LayoutGrid className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No hay entornos</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Comienza agregando un nuevo entorno
        </p>
        <button
          onClick={onAdd}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo entorno
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {environments.length} {environments.length === 1 ? 'entorno' : 'entornos'}
        </h2>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Ordenar</span>
          <button
            onClick={() => onHealthCheck()}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            title="Ordenar"
          >
            <ArrowUpDown className="w-5 h-5" />
          </button>
          
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-primary-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-primary-600'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              title="Vista de lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={onAdd}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
      }>
        {environments.map((environment) => (
          <EnvironmentCard
            key={environment.id}
            environment={environment}
            projects={projects}
            onEdit={onEdit}
            onDelete={onDelete}
            onHealthCheck={onHealthCheck}
            healthResults={healthResults}
            isLoadingHealth={isLoadingHealth}
            onFilterByProject={onFilterByProject}
          />
        ))}
      </div>
    </div>
  );
}
