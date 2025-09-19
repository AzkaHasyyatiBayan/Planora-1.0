import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are missing in .env.local");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types untuk Task
export interface Task {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  important: boolean;
  urgent: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  title: string;
  description?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  important?: boolean;
  urgent?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  is_completed?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  important?: boolean;
  urgent?: boolean;
}

// Interface untuk Display Task (frontend)
export interface DisplayTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  important: boolean;
  urgent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Task service dengan typed operations
export const taskService = {
  // Get all tasks dengan filter opsional
  async getTasks(filters?: {
    status?: string;
    priority?: string;
    important?: boolean;
    urgent?: boolean;
    is_completed?: boolean;
  }) {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.important !== undefined) {
      query = query.eq('important', filters.important);
    }
    if (filters?.urgent !== undefined) {
      query = query.eq('urgent', filters.urgent);
    }
    if (filters?.is_completed !== undefined) {
      query = query.eq('is_completed', filters.is_completed);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    
    return data as Task[];
  },

  // Get task by ID
  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
    
    return data as Task;
  },

  // Create new task
  async createTask(taskData: TaskInsert) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        is_completed: false,
        status: 'TODO',
        priority: taskData.priority || 'LOW',
        important: taskData.important || false,
        urgent: taskData.urgent || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }
    
    return data[0] as Task;
  },

  // Update task
  async updateTask(id: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }
    
    return data[0] as Task;
  },

  // Delete task
  async deleteTask(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
    
    return true;
  },

  // Toggle task completion
  async toggleTaskCompletion(id: string, completed: boolean) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        is_completed: completed,
        status: completed ? 'COMPLETED' : 'TODO',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
    
    return data[0] as Task;
  },

  // Search tasks
  async searchTasks(searchTerm: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
    
    return data as Task[];
  },

  // Get tasks for Eisenhower Matrix
  async getEisenhowerMatrix() {
    const { data, error } = await supabase
      .from('eisenhower_matrix')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Eisenhower matrix:', error);
      throw error;
    }
    
    return data as (Task & { quadrant: string })[];
  },

  // Get task statistics
  async getTaskStatistics() {
    const { data, error } = await supabase
      .rpc('get_task_statistics');

    if (error) {
      console.error('Error fetching task statistics:', error);
      throw error;
    }
    
    return data[0] as {
      total_tasks: number;
      completed_tasks: number;
      pending_tasks: number;
      high_priority_tasks: number;
      important_urgent_tasks: number;
    };
  }
};

// Real-time subscriptions
export const subscribeToTasks = (callback: (payload: unknown) => void) => {
  return supabase
    .channel('tasks_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks'
    }, callback)
    .subscribe();
};

// Helper functions
export const formatTaskForDisplay = (task: Task): DisplayTask => ({
  id: task.id,
  title: task.title,
  description: task.description,
  isCompleted: task.is_completed,
  priority: task.priority,
  status: task.status,
  important: task.important,
  urgent: task.urgent,
  createdAt: new Date(task.created_at),
  updatedAt: new Date(task.updated_at)
});

export const formatTaskForDatabase = (task: DisplayTask): Partial<Task> => ({
  id: task.id,
  title: task.title,
  description: task.description,
  is_completed: task.isCompleted,
  priority: task.priority,
  status: task.status,
  important: task.important,
  urgent: task.urgent,
  created_at: task.createdAt.toISOString(),
  updated_at: task.updatedAt.toISOString()
});

// Auth functions
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};