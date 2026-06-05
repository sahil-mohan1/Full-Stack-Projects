import { TaskCard } from './TaskCard';
import { EmptyState } from './EmptyState';
import { useTasks, type Task } from '../context/TaskContext';

interface TaskListProps {
  searchQuery: string;
  statusFilter: 'All' | 'Pending' | 'Completed';
  priorityFilter: 'All' | 'Low' | 'Medium' | 'High';
  sortBy: 'Newest' | 'Oldest' | 'Priority';
  onResetFilters: () => void;
  onEdit: (task: Task) => void;
  editingTask: Task | null;
}

export const TaskList = ({
  searchQuery,
  statusFilter,
  priorityFilter,
  sortBy,
  onResetFilters,
  onEdit,
  editingTask,
}: TaskListProps) => {
  const { tasks } = useTasks();

  // 1. Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === 'All' || task.status === statusFilter;

    // Priority filter
    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 2. Sort Tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'Newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'Oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'Priority') {
      const priorityWeights = { High: 3, Medium: 2, Low: 1 };
      // Sort descending by priority, and sub-sort by newest
      const weightDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  const isSearchOrFilterActive =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All';

  if (sortedTasks.length === 0) {
    return (
      <EmptyState
        isSearchOrFilterActive={isSearchOrFilterActive}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sortedTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          isEditing={editingTask?.id === task.id}
        />
      ))}
    </div>
  );
};
