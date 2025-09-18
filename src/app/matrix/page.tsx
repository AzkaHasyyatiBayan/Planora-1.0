'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, Clock, AlertTriangle, Minus, Sun, Moon, Grid3X3, BarChart3, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { classifyTask } from '@/lib/knnClassifier';

interface Task {
  id: string;
  title: string;
  description?: string;
  urgensi: 'Penting' | 'Kurang Penting';
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
  status: string;
  isCompleted: boolean;
  number?: number;
}

interface QuadrantConfigItem {
  title: string;
  subtitle: string;
  color: string;
  headerColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  actionText: string;
}

const quadrantConfig: Record<string, QuadrantConfigItem> = {
  importantUrgent: {
    title: 'Penting & Mendesak',
    subtitle: 'DO - Kerjakan Segera',
    color: 'bg-red-50',
    headerColor: 'bg-gradient-to-r from-red-500 to-red-600',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    description: 'Krisis dan deadline mendesak yang membutuhkan perhatian segera',
    actionText: 'Kerjakan sekarang juga!'
  },
  importantNotUrgent: {
    title: 'Penting & Tidak Mendesak',
    subtitle: 'PLAN - Rencanakan',
    color: 'bg-blue-50',
    headerColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Target,
    description: 'Tujuan jangka panjang dan pengembangan diri yang strategis',
    actionText: 'Jadwalkan waktu khusus'
  },
  notImportantUrgent: {
    title: 'Tidak Penting & Mendesak',
    subtitle: 'DELEGATE - Delegasikan',
    color: 'bg-yellow-50',
    headerColor: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: Clock,
    description: 'Gangguan dan interupsi yang dapat didelegasikan',
    actionText: 'Delegasikan ke orang lain'
  },
  notImportantNotUrgent: {
    title: 'Tidak Penting & Tidak Mendesak',
    subtitle: 'DELETE - Eliminasi',
    color: 'bg-gray-50',
    headerColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: Minus,
    description: 'Aktivitas yang membuang waktu dan sebaiknya dihindari',
    actionText: 'Eliminasi dari agenda'
  },
};

// Dark mode variants
const darkQuadrantConfig: Record<string, Partial<QuadrantConfigItem>> = {
  importantUrgent: {
    color: 'bg-red-900/20',
    borderColor: 'border-red-800/50',
    textColor: 'text-red-300'
  },
  importantNotUrgent: {
    color: 'bg-blue-900/20',
    borderColor: 'border-blue-800/50',
    textColor: 'text-blue-300'
  },
  notImportantUrgent: {
    color: 'bg-yellow-900/20',
    borderColor: 'border-yellow-800/50',
    textColor: 'text-yellow-300'
  },
  notImportantNotUrgent: {
    color: 'bg-gray-800/50',
    borderColor: 'border-gray-700',
    textColor: 'text-gray-300'
  },
};

// Simulasi fungsi classifyTask untuk development
const classifyTask = (task: Task): string => {
  const isImportant = task.urgensi === 'Penting';
  const isUrgent = task.prioritas === 'Tinggi';
  
  if (isImportant && isUrgent) return 'importantUrgent';
  if (isImportant && !isUrgent) return 'importantNotUrgent';
  if (!isImportant && isUrgent) return 'notImportantUrgent';
  return 'notImportantNotUrgent';
};

const EisenhowerMatrix: React.FC = () => {
  const [quadrants, setQuadrants] = useState<Record<string, Task[]>>({
    importantUrgent: [],
    importantNotUrgent: [],
    notImportantUrgent: [],
    notImportantNotUrgent: [],
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const router = useRouter();

  useEffect(() => {
    // Check for dark mode from localStorage or system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkMode = savedDarkMode ? savedDarkMode === 'true' : systemDarkMode;
    
    setIsDarkMode(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Dummy data untuk development - ganti dengan API call yang sebenarnya
      const dummyTasks: Task[] = [
        {
          id: '1',
          title: 'Menyelesaikan laporan bulanan',
          description: 'Laporan kinerja tim untuk bulan ini',
          urgensi: 'Penting',
          prioritas: 'Tinggi',
          status: 'In Progress',
          isCompleted: false
        },
        {
          id: '2',
          title: 'Meeting dengan klien besar',
          description: 'Presentasi proposal proyek strategis',
          urgensi: 'Penting',
          prioritas: 'Tinggi',
          status: 'Todo',
          isCompleted: false
        },
        {
          id: '3',
          title: 'Pelatihan skill development',
          description: 'Mengikuti kursus online programming',
          urgensi: 'Penting',
          prioritas: 'Sedang',
          status: 'Todo',
          isCompleted: false
        },
        {
          id: '4',
          title: 'Menjawab email rutin',
          description: 'Email follow-up dari berbagai departemen',
          urgensi: 'Kurang Penting',
          prioritas: 'Tinggi',
          status: 'Todo',
          isCompleted: false
        },
        {
          id: '5',
          title: 'Browsing media sosial',
          description: 'Scrolling social media tanpa tujuan',
          urgensi: 'Kurang Penting',
          prioritas: 'Rendah',
          status: 'Todo',
          isCompleted: false
        },
        {
          id: '6',
          title: 'Backup data sistem',
          description: 'Backup rutin data perusahaan',
          urgensi: 'Penting',
          prioritas: 'Sedang',
          status: 'Todo',
          isCompleted: false
        }
      ];

      // Ketika backend ready, uncomment ini:
      // const res = await fetch('/api/tasks');
      // if (!res.ok) throw new Error('Gagal mengambil data tugas');
      // const tasks: Task[] = await res.json();
      
      setTimeout(() => {
        classifyTasksToQuadrants(dummyTasks);
        setLoading(false);
      }, 1000); // Simulasi loading
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  const classifyTasksToQuadrants = (tasksData: Task[]) => {
    const classifiedQuadrants: Record<string, Task[]> = {
      importantUrgent: [],
      importantNotUrgent: [],
      notImportantUrgent: [],
      notImportantNotUrgent: [],
    };

    tasksData
      .filter(task => !task.isCompleted) // Filter out completed tasks
      .forEach((task, index) => {
        const taskWithNumber = { ...task, number: index + 1 };
        const quadrant = classifyTask(task);
        classifiedQuadrants[quadrant].push(taskWithNumber);
      });

    setQuadrants(classifiedQuadrants);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const getTotalTasks = (): number => {
    return Object.values(quadrants).reduce((total, quadrant) => total + quadrant.length, 0);
  };

  const getQuadrantPercentage = (quadrantTasks: Task[]): number => {
    const total = getTotalTasks();
    return total > 0 ? Math.round((quadrantTasks.length / total) * 100) : 0;
  };

  const getQuadrantConfig = (key: string) => {
    const base = quadrantConfig[key];
    const dark = isDarkMode ? darkQuadrantConfig[key] : {};
    return { ...base, ...dark };
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Menganalisis tugas dengan Eisenhower Matrix...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Terjadi Kesalahan
          </p>
          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={fetchTasks}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Coba Lagi
          </button>
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
                <Grid3X3 className="text-white" size={24} />
              </div>
              Eisenhower Matrix
            </h1>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Analisis tugas berdasarkan tingkat kepentingan dan urgensi
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
              onClick={() => router.push('/tasks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border-2 border-purple-600 transition-all duration-200 ${
                isDarkMode 
                  ? 'text-purple-400 hover:bg-purple-600 hover:text-white' 
                  : 'text-purple-600 hover:bg-purple-600 hover:text-white'
              }`}
            >
              <ArrowLeft size={18} />
              Kembali ke Tugas
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Tugas Aktif
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTotalTasks()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          {Object.entries(quadrants).map(([key, tasks], index) => {
            const config = getQuadrantConfig(key);
            const percentage = getQuadrantPercentage(tasks);
            return (
              <div key={key} className={`p-4 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {config.title.split(' & ')[0]}
                    </p>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {tasks.length} ({percentage}%)
                    </p>
                  </div>
                  <config.icon className={`w-6 h-6 ${config.textColor}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Matrix Grid */}
        {getTotalTasks() === 0 ? (
          <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
            isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
          }`}>
            <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Tidak Ada Tugas Aktif</p>
            <p className="text-sm mb-4">
              Belum ada tugas yang dapat dianalisis dengan Eisenhower Matrix
            </p>
            <button
              onClick={() => router.push('/tasks')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Tambah Tugas Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(quadrantConfig).map(([key, baseConfig]) => {
              const config = getQuadrantConfig(key);
              const tasks = quadrants[key] || [];
              const percentage = getQuadrantPercentage(tasks);
              
              return (
                <div
                  key={key}
                  className={`border rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                    isDarkMode 
                      ? `${config.color} ${config.borderColor}` 
                      : `${config.color} ${config.borderColor}`
                  }`}
                >
                  {/* Header */}
                  <div className={`${config.headerColor} rounded-t-xl px-6 py-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <baseConfig.icon size={24} className="text-white" />
                        <div>
                          <h3 className="font-bold text-white text-lg">
                            {config.title}
                          </h3>
                          <p className="text-white/90 text-sm">
                            {config.subtitle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {tasks.length}
                        </div>
                        <div className="text-white/80 text-sm">
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {config.description}
                    </p>
                    
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-white border text-gray-700'
                    }`}>
                      {config.actionText}
                    </div>

                    {tasks.length === 0 ? (
                      <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <baseConfig.icon size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Tidak ada tugas di kuadran ini</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                              isDarkMode 
                                ? 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`font-medium mb-1 ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {task.number}. {task.title}
                                </h4>
                                {task.description && (
                                  <p className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                                task.status === 'In Progress' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {task.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips Section */}
        <div className={`mt-8 p-6 rounded-xl border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Tips Penggunaan Matrix
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🔴 Kuadran 1 (DO): Fokus Utama
              </h4>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Tangani segera tugas-tugas krisis dan deadline mendesak
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🔵 Kuadran 2 (PLAN): Investasi Masa Depan  
              </h4>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Jadwalkan waktu untuk pengembangan dan pencegahan masalah
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                🟡 Kuadran 3 (DELEGATE): Efisiensi
              </h4>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Delegasikan atau otomatisasi tugas-tugas interupsi
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ⚫ Kuadran 4 (DELETE): Eliminasi
              </h4>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Kurangi atau hilangkan aktivitas yang membuang waktu
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;