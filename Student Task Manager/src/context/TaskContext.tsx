import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Completed' | 'Pending';
  createdAt: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updatedTask: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('apex_student_tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        // Initial seed tasks to look rich on first view
        const seedTasks: Task[] = [
          {
            id: '1',
            name: 'Prepare React assignment presentation',
            description: 'Design slides demonstrating useState, useEffect, and useContext with flow diagrams.',
            priority: 'High',
            status: 'Pending',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
          {
            id: '2',
            name: 'Complete Tailwind CSS layout exercises',
            description: 'Practice building glassmorphic interfaces and responsive sidebars using CSS variables.',
            priority: 'Medium',
            status: 'Completed',
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          },
          {
            id: '3',
            name: 'Review TypeScript generics documentation',
            description: 'Read the official handbook section on type parameters and generic constraints.',
            priority: 'Low',
            status: 'Pending',
            createdAt: new Date().toISOString(),
          }
        ];
        setTasks(seedTasks);
        localStorage.setItem('apex_student_tasks', JSON.stringify(seedTasks));
      }
    } catch (e) {
      console.error('Failed to load tasks from local storage', e);
    }
  }, []);

  // Save to local storage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('apex_student_tasks', JSON.stringify(tasks));
    } else {
      localStorage.removeItem('apex_student_tasks');
    }
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updatedFields } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' }
          : task
      )
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTaskStatus }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
