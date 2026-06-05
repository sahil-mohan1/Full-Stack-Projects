import { useState, useEffect, type FormEvent } from 'react';
import { PlusCircle, Save, X } from 'lucide-react';
import { useTasks, type Task } from '../context/TaskContext';

interface TaskFormProps {
  editingTask: Task | null;
  clearEditing: () => void;
}

export const TaskForm = ({ editingTask, clearEditing }: TaskFormProps) => {
  const { addTask, updateTask } = useTasks();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setErrors({});
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPriority('Medium');
    setErrors({});
  };

  const validate = () => {
    const newErrors: { name?: string; description?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Task name is required';
    } else if (name.length > 50) {
      newErrors.name = 'Task name must be under 50 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 200) {
      newErrors.description = 'Description must be under 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingTask) {
      updateTask(editingTask.id, { name, description, priority });
      clearEditing();
    } else {
      addTask({ name, description, priority });
    }
    resetForm();
  };

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden h-fit">
      {/* Visual backdrop glow */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <h2 className="text-xl font-bold font-outfit text-white mb-6 flex items-center gap-2">
        {editingTask ? (
          <>
            <Save className="h-5 w-5 text-indigo-400" />
            Edit Task
          </>
        ) : (
          <>
            <PlusCircle className="h-5 w-5 text-indigo-400" />
            Create New Task
          </>
        )}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name input */}
        <div className="space-y-2">
          <label htmlFor="task-name" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Task Name
          </label>
          <input
            id="task-name"
            type="text"
            placeholder="e.g. Study React Context API"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            className={`w-full bg-slate-950 border ${
              errors.name ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
            } rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-4 transition-all`}
          />
          {errors.name && (
            <p className="text-xs text-rose-400 font-medium mt-1 animate-fade-in">
              {errors.name}
            </p>
          )}
        </div>

        {/* Description textarea */}
        <div className="space-y-2">
          <label htmlFor="task-description" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Description
          </label>
          <textarea
            id="task-description"
            rows={4}
            placeholder="Provide brief details on what needs to be done..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
            }}
            className={`w-full bg-slate-950 border ${
              errors.description ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
            } rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-4 transition-all resize-none`}
          />
          {errors.description && (
            <p className="text-xs text-rose-400 font-medium mt-1 animate-fade-in">
              {errors.description}
            </p>
          )}
        </div>

        {/* Priority Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(['Low', 'Medium', 'High'] as const).map((level) => {
              const isActive = priority === level;
              const activeColor = 
                level === 'Low' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-emerald-glow' :
                level === 'Medium' ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-amber-glow' :
                'border-rose-500 bg-rose-500/10 text-rose-400 shadow-rose-glow';
              
              const hoverColor = 
                level === 'Low' ? 'hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-emerald-300' :
                level === 'Medium' ? 'hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-300' :
                'hover:border-rose-500/50 hover:bg-rose-500/5 hover:text-rose-300';

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`border rounded-xl py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                    isActive ? activeColor : `border-white/5 bg-slate-900/30 text-slate-400 ${hoverColor}`
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {editingTask && (
            <button
              type="button"
              onClick={() => {
                clearEditing();
                resetForm();
              }}
              className="flex-1 bg-slate-900 border border-white/5 text-slate-300 hover:bg-slate-800 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-indigo-glow transition-all duration-300 hover:scale-[1.02]"
          >
            {editingTask ? (
              <>
                <Save className="h-4 w-4" />
                Update Task
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                Add Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
