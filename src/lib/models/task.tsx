export enum PriorityLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: PriorityLevel;
  status: TaskStatus;
  important: boolean;
  urgent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: PriorityLevel;
  important?: boolean;
  urgent?: boolean;
}

export interface TaskFilters {
  searchTerm?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
  important?: boolean;
  urgent?: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  importantUrgent: number;
  importantNotUrgent: number;
  notImportantUrgent: number;
  notImportantNotUrgent: number;
}

// Helper functions
export const getPriorityLabel = (priority: PriorityLevel): string => {
  switch (priority) {
    case PriorityLevel.HIGH:
      return 'Tinggi';
    case PriorityLevel.MEDIUM:
      return 'Sedang';
    case PriorityLevel.LOW:
      return 'Rendah';
    default:
      return 'Tidak Diketahui';
  }
};

export const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return 'Belum Dikerjakan';
    case TaskStatus.IN_PROGRESS:
      return 'Sedang Dikerjakan';
    case TaskStatus.COMPLETED:
      return 'Selesai';
    default:
      return 'Tidak Diketahui';
  }
};

export const getPriorityColor = (priority: PriorityLevel): string => {
  switch (priority) {
    case PriorityLevel.HIGH:
      return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300';
    case PriorityLevel.MEDIUM:
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300';
    case PriorityLevel.LOW:
      return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300';
  }
};

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.TODO:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300';
    case TaskStatus.IN_PROGRESS:
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300';
    case TaskStatus.COMPLETED:
      return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300';
  }
};

// Validation functions
export const validateTask = (task: Partial<TaskFormData>): string[] => {
  const errors: string[] = [];

  if (!task.title || task.title.trim().length === 0) {
    errors.push('Judul tugas wajib diisi');
  }

  if (task.title && task.title.trim().length > 200) {
    errors.push('Judul tugas maksimal 200 karakter');
  }

  if (task.description && task.description.length > 1000) {
    errors.push('Deskripsi tugas maksimal 1000 karakter');
  }

  return errors;
};

// Task classification for Eisenhower Matrix
export const classifyTask = (task: Task): string => {
  if (task.important && task.urgent) return 'importantUrgent';
  if (task.important && !task.urgent) return 'importantNotUrgent';
  if (!task.important && task.urgent) return 'notImportantUrgent';
  return 'notImportantNotUrgent';
};

// Calculate task statistics
export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.isCompleted).length;
  const pending = total - completed;
  const highPriority = tasks.filter(task => task.priority === PriorityLevel.HIGH && !task.isCompleted).length;
  
  const importantUrgent = tasks.filter(task => 
    task.important && task.urgent && !task.isCompleted
  ).length;
  
  const importantNotUrgent = tasks.filter(task => 
    task.important && !task.urgent && !task.isCompleted
  ).length;
  
  const notImportantUrgent = tasks.filter(task => 
    !task.important && task.urgent && !task.isCompleted
  ).length;
  
  const notImportantNotUrgent = tasks.filter(task => 
    !task.important && !task.urgent && !task.isCompleted
  ).length;

  return {
    total,
    completed,
    pending,
    highPriority,
    importantUrgent,
    importantNotUrgent,
    notImportantUrgent,
    notImportantNotUrgent
  };
};