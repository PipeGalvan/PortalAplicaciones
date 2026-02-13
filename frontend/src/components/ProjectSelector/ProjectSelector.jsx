import { cn } from '../../utils/cn';

export function ProjectSelector({ projects, selectedProject, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Proyecto</label>
      <select
        value={selectedProject || ''}
        onChange={(e) => onChange(e.target.value || null)}
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
  );
}
