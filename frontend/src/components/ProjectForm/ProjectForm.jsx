import { useState } from 'react';
import { X } from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Púrpura', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Cian', value: '#06b6d4' },
  { name: 'Amarillo', value: '#eab308' },
  { name: 'Gris', value: '#6b7280' },
  { name: 'Indigo', value: '#6366f1' },
];

export function ProjectForm({ project, onSave, onClose }) {
  const isEditing = !!project;
  const [useCustomColor, setUseCustomColor] = useState(project?.color && !COLOR_PRESETS.find(p => p.value === project.color));

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      color: formData.get('color'),
      team: formData.get('team'),
      isActive: formData.get('isActive') === 'true'
    };
    onSave(data);
  };

  const handleColorPresetClick = (color) => {
    document.querySelector('input[name="color"]').value = color;
    setUseCustomColor(false);
  };

  const handleCustomColorChange = (e) => {
    setUseCustomColor(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre *</label>
            <input
              name="name"
              defaultValue={project?.name}
              required
              className="input"
              placeholder="Nombre del proyecto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="description"
              defaultValue={project?.description}
              className="input"
              rows={2}
              placeholder="Descripción del proyecto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleColorPresetClick(preset.value)}
                  className={cn(
                    'w-10 h-10 rounded-lg border-2 transition-all',
                    project?.color === preset.value || (!project?.color && !useCustomColor && preset.value === COLOR_PRESETS[0].value)
                      ? 'border-gray-900 dark:border-gray-100 scale-110'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                name="color"
                type="color"
                defaultValue={project?.color || COLOR_PRESETS[0].value}
                onChange={handleCustomColorChange}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {useCustomColor ? 'Color personalizado' : 'Color del preset'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Equipo responsable</label>
            <input
              name="team"
              defaultValue={project?.team}
              className="input"
              placeholder="Nombre del equipo"
            />
          </div>

          {isEditing && (
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={project?.isActive ?? true}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm">Proyecto activo</span>
              </label>
            </div>
          )}

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

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
