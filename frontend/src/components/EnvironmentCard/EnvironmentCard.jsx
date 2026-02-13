import { Star, Copy, ExternalLink, Edit, Trash2, Database, Globe, Server, RefreshCw, Settings } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { HealthCheck } from '../HealthCheck/HealthCheck';
import { cn } from '../../utils/cn';

export function EnvironmentCard({ environment, projects, onEdit, onDelete, onHealthCheck, healthResults, isLoadingHealth, onFilterByProject }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const healthResult = healthResults[environment.id];

  const getIcon = () => {
    switch (environment.type) {
      case 'http':
        return <Globe className="w-5 h-5 text-primary-600" />;
      case 'tcp':
        return <Server className="w-5 h-5 text-primary-600" />;
      default:
        return <Database className="w-5 h-5 text-primary-600" />;
    }
  };

  const getCategoryColor = () => {
    switch (environment.category) {
      case 'Desarrollo':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'QA':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Producción':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Staging':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const isShared = environment.projects && environment.projects.length > 1;
  const environmentProjects = environment.projects?.map(pId => projects.find(p => p.id === pId)).filter(Boolean) || [];

  const hasVersions = environment.gxVersion || environment.tomcatVersion || environment.dbVersion;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="text-lg font-semibold">{environment.name}</h3>
          {isShared && (
            <RefreshCw 
              className="w-4 h-4 text-gray-400" 
              title={`Compartido en ${environment.projects.length} proyectos`}
            />
          )}
        </div>
        <button
          onClick={() => toggleFavorite(environment.id)}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isFavorite(environment.id)
              ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900'
              : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900'
          )}
        >
          <Star className={cn('w-5 h-5', isFavorite(environment.id) && 'fill-current')} />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium shrink-0">URL:</span>
          <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs truncate" title={environment.url}>
            {environment.url}
          </code>
          <button
            onClick={() => copyToClipboard(environment.url)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded shrink-0"
            title="Copiar URL"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        
        {environment.port && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Puerto:</span> {environment.port}
          </div>
        )}
        
        {environment.database && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">BD:</span> {environment.database}
          </div>
        )}
      </div>

      {hasVersions && (
        <div className="mb-4 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-1.5">
            <Settings className="w-3 h-3" />
            <span className="font-medium">Versiones</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {environment.gxVersion && <div>GX {environment.gxVersion}</div>}
            {environment.tomcatVersion && <div>Tomcat {environment.tomcatVersion}</div>}
            {environment.dbVersion && <div>{environment.dbVersion}</div>}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {environment.category && (
          <span className={cn('badge', getCategoryColor())}>{environment.category}</span>
        )}
        {environmentProjects.map(project => (
          <span
            key={project.id}
            className="badge cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: `${project.color}20`,
              color: project.color,
              border: `1px solid ${project.color}40`
            }}
            onClick={() => onFilterByProject(project.id)}
            title={project.name}
          >
            {project.name}
          </span>
        ))}
        {environment.tags?.map((tag) => (
          <span key={tag} className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <HealthCheck
          environment={environment}
          onCheck={onHealthCheck}
          result={healthResult}
          isLoading={isLoadingHealth === environment.id}
        />
        
        <div className="flex items-center gap-2">
          {environment.type === 'http' && (
            <a
              href={environment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
              title="Abrir aplicación"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => onEdit(environment)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(environment.id)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg text-red-600 dark:text-red-400"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
