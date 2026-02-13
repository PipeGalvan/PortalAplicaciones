import { Filter } from 'lucide-react';

export function FilterPanel({ filters, onFilterChange, projects }) {
  const categories = ['Todos', 'Desarrollo', 'QA', 'Producción', 'Staging'];
  const types = ['Todos', 'http', 'tcp'];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold">Filtros</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Categoría</label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="input"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tipo</label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="input"
          >
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {projects && projects.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Proyecto</label>
            <select
              value={filters.project || ''}
              onChange={(e) => onFilterChange({ ...filters, project: e.target.value || null })}
              className="input"
            >
              <option value="">Todos</option>
              {projects
                .filter(p => p.isActive)
                .map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              }
            </select>
          </div>
        )}
        
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={(e) => onFilterChange({ ...filters, favoritesOnly: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm">Solo favoritos</span>
          </label>
        </div>
      </div>
    </div>
  );
}
