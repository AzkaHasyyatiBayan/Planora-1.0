'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { Eye, Plus, CheckCircle, Search, Moon, Sun, Trash2, Edit3, AlertCircle, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/taskForm';
import { PriorityLevel, TaskStatus } from '@/lib/models/task';
import { supabase } from '@/lib/supabaseClient'; // Mengubah dari taskService ke supabase

interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: PriorityLevel;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  important: boolean;
  urgent: boolean;
}

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Belum Dikerjakan' | 'Sedang Dikerjakan' | 'Selesai'>('Semua');
  const [filterPrioritas, setFilterPrioritas] = useState<'Semua' | 'Tinggi' | 'Sedang' | 'Rendah'>('Semua');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkMode = savedDarkMode ? savedDarkMode === 'true' : systemDarkMode;
    setIsDarkMode(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      interface SupabaseTask {
        id: string;
        title: string;
        description?: string;
        is_completed: boolean;
        priority: PriorityLevel;
        status: TaskStatus;
        important: boolean;
        urgent: boolean;
        created_at: string;
        updated_at: string;
      }

      const mappedTasks: Task[] = (data as SupabaseTask[]).map((task) => ({
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
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Gagal memuat tugas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapStatus = (status: string) => {
    switch (status) {
      case 'Belum Dikerjakan':
        return TaskStatus.TODO;
      case 'Sedang Dikerjakan':
        return TaskStatus.IN_PROGRESS;
      case 'Selesai':
        return TaskStatus.COMPLETED;
      case 'Semua':
      default:
        return null;
    }
  };

  const mapPrioritas = (prioritas: string) => {
    switch (prioritas) {
      case 'Tinggi':
        return PriorityLevel.HIGH;
      case 'Sedang':
        return PriorityLevel.MEDIUM;
      case 'Rendah':
        return PriorityLevel.LOW;
      case 'Semua':
      default:
        return null;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const statusFilter = mapStatus(filterStatus);
    const prioritasFilter = mapPrioritas(filterPrioritas);

    const matchesStatus = !statusFilter || 
      (statusFilter === TaskStatus.COMPLETED ? task.isCompleted : task.status === statusFilter);
    
    const matchesPrioritas = !prioritasFilter || task.priority === prioritasFilter;

    return matchesSearch && matchesStatus && matchesPrioritas;
  });

  const getPriorityColor = (priority: PriorityLevel) => {
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

  const getPriorityIcon = (priority: PriorityLevel) => {
    switch (priority) {
      case PriorityLevel.HIGH:
        return <AlertCircle className="w-4 h-4" />;
      case PriorityLevel.MEDIUM:
        return <Clock className="w-4 h-4" />;
      case PriorityLevel.LOW:
        return <Star className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Gagal menghapus tugas:', error);
    }
  };

  const handleUpdate = async (updatedTask: { id: string; completed?: boolean }) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: updatedTask.completed,
          status: updatedTask.completed ? TaskStatus.COMPLETED : TaskStatus.TODO,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedTask.id);

      if (error) throw error;

      setTasks(prev =>
        prev.map(task =>
          task.id === updatedTask.id
            ? {
                ...task,
                isCompleted: updatedTask.completed ?? task.isCompleted,
                status: updatedTask.completed ? TaskStatus.COMPLETED : TaskStatus.TODO,
                updatedAt: new Date()
              }
            : task
        )
      );
    } catch (error) {
      console.error('Gagal mengupdate tugas:', error);
    }
  };

  const handleAddTask = async (newTask: { title: string; description: string; priority?: PriorityLevel }) => {
    try {
      const taskToAdd = {
        title: newTask.title,
        description: newTask.description,
        is_completed: false,
        priority: newTask.priority || PriorityLevel.LOW,
        status: TaskStatus.TODO,
        important: false,
        urgent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskToAdd])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const createdTask = data[0];
        const mappedTask: Task = {
          id: createdTask.id,
          title: createdTask.title,
          description: createdTask.description,
          isCompleted: createdTask.is_completed,
          priority: createdTask.priority,
          status: createdTask.status,
          important: createdTask.important,
          urgent: createdTask.urgent,
          createdAt: new Date(createdTask.created_at),
          updatedAt: new Date(createdTask.updated_at)
        };

        setTasks(prev => [mappedTask, ...prev]);
      }

      setShowForm(false);
    } catch (error) {
      console.error('Gagal menambah tugas:', error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter(task => task.priority === PriorityLevel.HIGH && !task.isCompleted).length;

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memuat tugas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold flex items-center gap-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="text-white" size={24} />
              </div>
              Manajemen Tugas
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Kelola tugas Anda dengan sistem prioritas dan urgensi yang efektif
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
            
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Plus size={18} />
              Tambah Tugas
            </button>
            
            <button
              onClick={() => router.push('/matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border-2 border-purple-600 transition-all duration-200 ${
                isDarkMode
                  ? 'text-purple-400 hover:bg-purple-600 hover:text-white'
                  : 'text-purple-600 hover:bg-purple-600 hover:text-white'
              }`}
            >
              <Eye size={18} />
              Lihat Matrix
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tugas', value: totalTasks, color: 'blue', icon: CheckCircle },
            { label: 'Selesai', value: completedTasks, color: 'green', icon: CheckCircle },
            { label: 'Pending', value: pendingTasks, color: 'yellow', icon: Clock },
            { label: 'Prioritas Tinggi', value: highPriorityTasks, color: 'red', icon: AlertCircle }
          ].map((stat, index) => (
            <div key={index} className={`p-4 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className={`p-6 rounded-xl shadow-sm border mb-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative w-full lg:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari berdasarkan judul atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
              />
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
              <select
                value={filterStatus}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFilterStatus(e.target.value as 'Semua' | 'Belum Dikerjakan' | 'Sedang Dikerjakan' | 'Selesai')
                }
                className={`flex-1 lg:w-48 px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
              >
                <option value="Semua">Semua Status</option>
                <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                <option value="Selesai">Selesai</option>
              </select>

              <select
                value={filterPrioritas}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setFilterPrioritas(e.target.value as 'Semua' | 'Tinggi' | 'Sedang' | 'Rendah')
                }
                className={`flex-1 lg:w-48 px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
              >
                <option value="Semua">Semua Prioritas</option>
                <option value="Tinggi">Prioritas Tinggi</option>
                <option value="Sedang">Prioritas Sedang</option>
                <option value="Rendah">Prioritas Rendah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className={`mb-6 p-6 rounded-xl shadow-sm border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <TaskForm onSubmit={handleAddTask} />
          </div>
        )}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
            isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
          }`}>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {searchTerm || filterStatus !== 'Semua' || filterPrioritas !== 'Semua'
                ? 'Tidak ada tugas yang sesuai dengan filter'
                : 'Belum ada tugas'}
            </p>
            <p className="text-sm">
              {searchTerm || filterStatus !== 'Semua' || filterPrioritas !== 'Semua'
                ? 'Coba ubah kriteria pencarian atau filter'
                : 'Klik "Tambah Tugas" untuk membuat tugas pertama Anda'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } ${task.isCompleted ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={(e) => handleUpdate({ id: task.id, completed: e.target.checked })}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-1"
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      } ${task.isCompleted ? 'line-through' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        } ${task.isCompleted ? 'line-through' : ''}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          getPriorityColor(task.priority)
                        }`}>
                          {getPriorityIcon(task.priority)}
                          {task.priority === PriorityLevel.HIGH ? 'Tinggi' :
                           task.priority === PriorityLevel.MEDIUM ? 'Sedang' : 'Rendah'}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Dibuat: {task.createdAt.toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {/* TODO: Implementasi edit */}}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700'
                          : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;