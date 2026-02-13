import { X } from 'lucide-react';

export function EnvironmentForm({ environment, projects, onSave, onClose }) {
  const isEditing = !!environment;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedProjects = [];
    projects.filter(p => p.isActive).forEach(p => {
      if (formData.get(`project_${p.id}`)) {
        selectedProjects.push(p.id);
      }
    });

    if (selectedProjects.length === 0) {
      alert('Debes seleccionar al menos un proyecto');
      return;
    }

    const data = {
      name: formData.get('name'),
      url: formData.get('url'),
      port: formData.get('port'),
      database: formData.get('database'),
      type: formData.get('type'),
      category: formData.get('category'),
      httpMethod: formData.get('httpMethod') || 'HEAD',
      projects: selectedProjects,
      gxVersion: formData.get('gxVersion'),
      tomcatVersion: formData.get('tomcatVersion'),
      dbVersion: formData.get('dbVersion'),
      tags: formData.get('tags')?.split(',').map(t => t.trim()).filter(Boolean),
      notes: formData.get('notes')
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar entorno' : 'Nuevo entorno'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                name="name"
                defaultValue={environment?.name}
                required
                className="input"
                placeholder="Nombre del entorno"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo *</label>
              <select
                name="type"
                defaultValue={environment?.type || 'http'}
                required
                className="input"
              >
                <option value="http">HTTP</option>
                <option value="tcp">TCP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL *</label>
              <input
                name="url"
                defaultValue={environment?.url}
                required
                className="input"
                placeholder="https://ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Método HTTP</label>
              <select
                name="httpMethod"
                defaultValue={environment?.httpMethod || 'HEAD'}
                className="input"
              >
                <option value="HEAD">HEAD (recomendado)</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Puerto</label>
              <input
                name="port"
                type="number"
                defaultValue={environment?.port}
                className="input"
                placeholder="8080"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                name="category"
                defaultValue={environment?.category || 'Desarrollo'}
                className="input"
              >
                <option value="Desarrollo">Desarrollo</option>
                <option value="QA">QA</option>
                <option value="Producción">Producción</option>
                <option value="Staging">Staging</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Proyectos *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {projects
                  .filter(p => p.isActive)
                  .map(project => (
                    <label key={project.id} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        name={`project_${project.id}`}
                        defaultChecked={environment?.projects?.includes(project.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-sm truncate">{project.name}</span>
                      </div>
                    </label>
                  ))
                }
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Base de datos</label>
              <input
                name="database"
                defaultValue={environment?.database}
                className="input"
                placeholder="nombre_bd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Versión GX</label>
              <input
                name="gxVersion"
                defaultValue={environment?.gxVersion}
                className="input"
                placeholder="Ev3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Versión Tomcat</label>
              <input
                name="tomcatVersion"
                defaultValue={environment?.tomcatVersion}
                className="input"
                placeholder="9.0.x"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Versión BD</label>
              <input
                name="dbVersion"
                defaultValue={environment?.dbVersion}
                className="input"
                placeholder="PostgreSQL 14"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Tags (separados por coma)</label>
              <input
                name="tags"
                defaultValue={environment?.tags?.join(', ')}
                className="input"
                placeholder="api, servicio, crítico"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Notas</label>
              <textarea
                name="notes"
                defaultValue={environment?.notes}
                className="input"
                rows={3}
                placeholder="Información adicional..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
