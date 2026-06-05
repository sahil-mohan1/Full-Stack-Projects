import { Trash2, Edit3, Calendar, Check } from 'lucide-react';
import { useTasks, type Task } from '../context/TaskContext';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  isEditing: boolean;
}

export const TaskCard = ({ task, onEdit, isEditing }: TaskCardProps) => {
  const { toggleTaskStatus, deleteTask } = useTasks();

  const formattedDate = new Date(task.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Priority color mappings
  const priorityClasses = {
    Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const isCompleted = task.status === 'Completed';

  return (
    <div
      className={`glass-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${
        isEditing 
          ? 'border-indigo-500 bg-indigo-950/20 shadow-indigo-glow scale-[0.99]' 
          : isCompleted 
            ? 'opacity-65 border-white/5 bg-slate-950/40 hover:opacity-90' 
            : 'glass-card-hover'
      }`}
    >
      {/* Visual background glow for high-priority items */}
      {!isCompleted && task.priority === 'High' && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
      )}

      <div>
        {/* Header containing priority badge and actions */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
              priorityClasses[task.priority]
            }`}
          >
            {task.priority} Priority
          </span>

          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              disabled={isCompleted}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                isCompleted ? 'cursor-not-allowed opacity-30' : ''
              }`}
              title="Edit Task"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${task.name}"?`)) {
                  deleteTask(task.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Checkbox and task body */}
        <div className="flex items-start gap-3.5">
          {/* Custom Checkbox */}
          <div className="relative flex items-center justify-center mt-1">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => toggleTaskStatus(task.id)}
              className="task-checkbox sr-only"
              id={`check-${task.id}`}
            />
            <label
              htmlFor={`check-${task.id}`}
              className={`checkbox-custom h-5 w-5 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-200 ${
                isCompleted 
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-glow' 
                  : 'border-white/20 bg-slate-900 hover:border-indigo-400'
              }`}
            >
              <Check className={`h-3.5 w-3.5 transition-transform duration-200 ${isCompleted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} />
            </label>
          </div>

          <div className="flex-1 space-y-1">
            <h3
              className={`font-semibold text-base font-outfit text-slate-100 leading-snug break-words transition-all duration-300 ${
                isCompleted ? 'line-through text-slate-500 decoration-slate-600' : ''
              }`}
            >
              {task.name}
            </h3>
            <p
              className={`text-sm text-slate-400 font-normal leading-relaxed break-words transition-all ${
                isCompleted ? 'text-slate-600' : ''
              }`}
            >
              {task.description}
            </p>
          </div>
        </div>
      </div>

      {/* Footer detailing date created */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-5 pt-3 border-t border-white/5">
        <Calendar className="h-3.5 w-3.5 text-slate-600" />
        <span>Added {formattedDate}</span>
      </div>
    </div>
  );
};
