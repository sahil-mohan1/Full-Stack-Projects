import { useState } from 'react';
import { TaskProvider, type Task } from './context/TaskContext';
import { Header } from './components/Header';
import { TaskStats } from './components/TaskStats';
import { TaskForm } from './components/TaskForm';
import { FilterSection } from './components/FilterSection';
import { TaskList } from './components/TaskList';

function AppContent() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'Priority'>('Newest');

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    // Smooth scroll to form on mobile devices
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearEditing = () => {
    setEditingTask(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSortBy('Newest');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Brand Header */}
      <Header />

      {/* Stats Section */}
      <TaskStats />

      {/* Main Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column - Sticky on scroll for desktop */}
        <div className="lg:col-span-4 lg:sticky lg:top-8">
          <TaskForm 
            editingTask={editingTask} 
            clearEditing={clearEditing} 
          />
        </div>

        {/* Board Column */}
        <div className="lg:col-span-8 space-y-6">
          <FilterSection
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <TaskList
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            sortBy={sortBy}
            onResetFilters={handleResetFilters}
            onEdit={handleEditTask}
            editingTask={editingTask}
          />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-xs text-slate-600 border-t border-white/5">
        <p>&copy; {new Date().getFullYear()} ApexTask Workspace. Engineered for speed and visual excellence.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;
