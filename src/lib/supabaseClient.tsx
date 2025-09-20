import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
// Perbaikan 1: Impor tipe payload dari Supabase
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are missing in .env.local");
}

export const supabase = createPagesBrowserClient();

// Types untuk Profile
export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface ProfileUpdate {
  name?: string;
  avatar_url?: string;
}

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

// --- SERVICES ---

// Profile service
export const profileService = {
  // Get profile by user ID
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Abaikan error jika profil tidak ditemukan
      console.error('Error fetching profile:', error);
      throw error;
    }
    return data as Profile | null;
  },

  // Create or update profile
  async upsertProfile(profileData: ProfileInsert) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      throw error;
    }
    return data as Profile;
  },

  // Update profile
  async updateProfile(userId: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    return data as Profile;
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Delete old avatar
  async deleteAvatar(filePath: string) {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting avatar:', error);
    }
    return !error;
  }
};

// Task service
export const taskService = {
  // Get all tasks
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

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);
    if (filters?.important !== undefined) query = query.eq('important', filters.important);
    if (filters?.urgent !== undefined) query = query.eq('urgent', filters.urgent);
    if (filters?.is_completed !== undefined) query = query.eq('is_completed', filters.is_completed);

    const { data, error } = await query;
    if (error) throw error;
    return data as Task[];
  },

  // Get task by ID
  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Task;
  },

  // Create new task
  async createTask(taskData: TaskInsert) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...taskData }])
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  // Update task
  async updateTask(id: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Task;
  },

  // Delete task
  async deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

// Auth service
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
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


// --- REAL-TIME SUBSCRIPTIONS ---

// Perbaikan 2: Ganti 'any' dengan tipe yang spesifik
export const subscribeToTasks = (callback: (payload: RealtimePostgresChangesPayload<Task>) => void) => {
  return supabase
    .channel('tasks_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks'
    }, callback)
    .subscribe();
};

// Perbaikan 3: Ganti 'any' dengan tipe yang spesifik
export const subscribeToProfile = (userId: string, callback: (payload: RealtimePostgresChangesPayload<Profile>) => void) => {
  return supabase
    .channel(`profile_changes_for_${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${userId}` // <-- Hanya dengarkan perubahan untuk user ini
    }, callback)
    .subscribe();
};


// --- HELPER FUNCTIONS ---

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