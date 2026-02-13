import { useState } from 'react';
import { FolderOpen, Plus, MoreHorizontal, ToggleLeft, ToggleRight, Edit, Trash2, History } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ProjectSidebar({ 
  projects, 
  selectedProject, 
  onSelectProject, 
  onCreateProject, 
  onToggleProject,
  onEditProject,
  onDeleteProject,
  onViewHistory,
  showInactive,
  onToggleShowInactive,
  getProjectCount
}) {
  const activeProjects = projects.filter(p => p.isActive);
  const inactiveProjects = projects.filter(p => !p.isActive);

  return (
    <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Proyectos</h2>
          <button
            onClick={onCreateProject}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-primary-600 dark:text-primary-400"
            title="Nuevo proyecto"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={onToggleShowInactive}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-gray-600 dark:text-gray-400">Mostrar inactivos</span>
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button
            onClick={() => onSelectProject(null)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
              selectedProject === null
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            )}
          >
            <FolderOpen className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">Todos</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {projects.reduce((acc, p) => acc + getProjectCount(p.id), 0)} entornos
              </div>
            </div>
          </button>

          {activeProjects.map(project => (
            <ProjectItem
              key={project.id}
              project={project}
              selected={selectedProject === project.id}
              onClick={() => onSelectProject(project.id)}
              onToggle={() => onToggleProject(project.id)}
              onEdit={() => onEditProject(project)}
              onDelete={() => onDeleteProject(project.id)}
              onViewHistory={() => onViewHistory(project)}
              getProjectCount={getProjectCount}
            />
          ))}

          {showInactive && inactiveProjects.length > 0 && (
            <div className="mt-4">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Inactivos
              </div>
              {inactiveProjects.map(project => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  selected={selectedProject === project.id}
                  onClick={() => onSelectProject(project.id)}
                  onToggle={() => onToggleProject(project.id)}
                  onEdit={() => onEditProject(project)}
                  onDelete={() => onDeleteProject(project.id)}
                  onViewHistory={() => onViewHistory(project)}
                  getProjectCount={getProjectCount}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectItem({ project, selected, onClick, onToggle, onEdit, onDelete, onViewHistory, getProjectCount }) {
  const [showActions, setShowActions] = useState(false);
  const count = getProjectCount(project.id);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group',
        selected
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: project.color }}
      />
      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="font-medium truncate">{project.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {count} {count === 1 ? 'entorno' : 'entornos'}
        </div>
      </div>
      
      {showActions && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title={project.isActive ? 'Desactivar' : 'Activar'}
          >
            {project.isActive ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Historial"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
