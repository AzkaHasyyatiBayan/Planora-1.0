'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Clock, 
  AlertTriangle, 
  Minus, 
  ArrowLeft,
  Grid3X3,
  Moon,
  MoreHorizontal,
  CheckCircle,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// ===== TYPES =====
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  isAllDay?: boolean;
  important?: boolean;
  urgent?: boolean;
  status?: string;
  isCompleted?: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  important: boolean;
  urgent: boolean;
  status: string;
  is_completed: boolean;
  due_date?: string | null;
  user_id: string;
}

// ===== MAIN PAGE COMPONENT =====
export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const router = useRouter();

  // ===== FUNCTIONS =====
  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleDateClick = (date: Date) => {
    console.log('Date selected:', date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
  };

  const toggleShowCompleted = () => {
    setShowCompleted(!showCompleted);
  };

  const classifyEvent = (event: CalendarEvent): string => {
    if (event.important && event.urgent) return 'importantUrgent';
    if (event.important && !event.urgent) return 'importantNotUrgent';
    if (!event.important && event.urgent) return 'notImportantUrgent';
    return 'notImportantNotUrgent';
  };

  const getEventColor = (event: CalendarEvent): string => {
    if (event.isCompleted) return '#10b981';
    
    const quadrant = classifyEvent(event);
    switch (quadrant) {
      case 'importantUrgent': return '#ef4444';
      case 'importantNotUrgent': return '#3b82f6';
      case 'notImportantUrgent': return '#eab308';
      case 'notImportantNotUrgent': return '#6b7280';
      default: return event.color || '#3b82f6';
    }
  };

  const getEventIcon = (event: CalendarEvent) => {
    if (event.isCompleted) return CheckCircle;
    
    const quadrant = classifyEvent(event);
    switch (quadrant) {
      case 'importantUrgent': return AlertTriangle;
      case 'importantNotUrgent': return Target;
      case 'notImportantUrgent': return Clock;
      case 'notImportantNotUrgent': return Minus;
      default: return Minus;
    }
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const allEvents = showCompleted ? [...events, ...completedEvents] : events;
    return allEvents.filter(event => 
      new Date(event.start).toDateString() === date.toDateString()
    );
  };

  const convertTasksToEvents = useCallback((tasks: Task[]): CalendarEvent[] => {
    return tasks.map(task => {
      // Handle due_date yang mungkin null
      const dueDate = task.due_date ? new Date(task.due_date) : new Date();
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        start: dueDate,
        end: new Date(dueDate.getTime() + 60 * 60 * 1000), // Tambah 1 jam
        important: task.important,
        urgent: task.urgent,
        status: task.status,
        isCompleted: task.is_completed
      };
    });
  }, []);

  // Gunakan useCallback untuk fetchTasks agar tidak berubah setiap render
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Error getting session: ${sessionError.message}`);
      }
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
        .order('due_date', { ascending: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const tasksData = data as Task[] || [];
      const allEvents = convertTasksToEvents(tasksData);
      
      const pendingEvents = allEvents.filter(event => !event.isCompleted);
      const completedEventsData = allEvents.filter(event => event.isCompleted);
      
      setEvents(pendingEvents);
      setCompletedEvents(completedEventsData);
    } catch (err) {
      console.error('Error in fetchTasks:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [convertTasksToEvents]); // convertTasksToEvents sudah menggunakan useCallback

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  // ===== USE EFFECT =====
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkMode = savedDarkMode ? savedDarkMode === 'true' : systemDarkMode;
    setIsDarkMode(darkMode);
    document.documentElement.classList.toggle('dark', darkMode);

    fetchTasks();
  }, [fetchTasks]); // Tambahkan fetchTasks ke dependency array

  // ===== RENDER CALENDAR DAYS =====
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="min-h-[120px] p-2 bg-gray-50 border border-gray-200"
        ></div>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      
      days.push(
        <div
          key={day}
          className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-50 bg-white ${
            isToday ? 'ring-2 ring-purple-500 ring-inset' : ''
          }`}
          onClick={() => handleDateClick(date)}
        >
          <div className={`flex justify-between items-center mb-1 ${isToday ? 'font-bold' : 'font-semibold'}`}>
            <span className={`text-sm ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
              {day}
            </span>
            {isToday && (
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            )}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map(event => {
              const EventIcon = getEventIcon(event);
              const color = getEventColor(event);
              const isCompleted = event.isCompleted;
              
              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-1 p-1 px-2 rounded text-xs transition-all duration-200 hover:opacity-80 hover:translate-x-0.5 ${
                    isCompleted ? 'opacity-70' : ''
                  }`}
                  style={{ 
                    backgroundColor: `${color}15`,
                    borderLeft: `3px solid ${color}`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  <EventIcon size={10} style={{ color }} />
                  <span className={`truncate ${isCompleted ? 'line-through' : ''}`} style={{ color: '#1f2937' }}>
                    {event.title}
                  </span>
                </div>
              );
            })}
          </div>
          
          {dayEvents.length > 3 && (
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <MoreHorizontal size={12} className="mr-1" />
              <span>+{dayEvents.length - 3} lainnya</span>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // ===== RENDER =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Memuat kalender...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2 text-gray-900">
            Terjadi Kesalahan
          </p>
          <p className="mb-4 text-gray-600">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <Grid3X3 className="text-white" size={24} />
              </div>
              Kalender Tugas
            </h1>
            <p className="mt-2 text-gray-600">
              Lihat tugas Anda dalam tampilan kalender
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleShowCompleted}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                showCompleted
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showCompleted ? <CheckCircle size={18} /> : <X size={18} />}
              {showCompleted ? 'Sembunyikan Selesai' : 'Tampilkan Selesai'}
            </button>

            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Moon size={18} />
              Dark Mode
            </button>
            
            <button
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-purple-600 text-white hover:bg-purple-700"
            >
              <ArrowLeft size={18} />
              Kembali ke Tugas
            </button>
          </div>
        </div>

        {/* Calendar Component */}
        <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
            <button 
              onClick={handlePreviousMonth}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h2 className="text-xl font-semibold">
              {currentDate.toLocaleDateString('id-ID', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            <button 
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Week Days */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div 
                key={day} 
                className="p-3 text-center font-medium text-sm text-gray-700 bg-gray-50"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Stats dan Legenda */}
        <div className="mt-8 p-6 rounded-2xl bg-white shadow-lg">
          <h3 className="font-semibold mb-6 text-lg text-gray-900">
            Legenda Prioritas Tugas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div>
                <p className="font-medium text-gray-900">
                  Penting & Mendesak
                </p>
                <p className="text-sm text-red-600">
                  Tugas yang harus segera diselesaikan
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <p className="font-medium text-gray-900">
                  Penting & Tidak Mendesak
                </p>
                <p className="text-sm text-blue-600">
                  Tugas perencanaan jangka panjang
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <p className="font-medium text-gray-900">
                  Tidak Penting & Mendesak
                </p>
                <p className="text-sm text-yellow-600">
                  Tugas yang bisa didelegasikan
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <div>
                <p className="font-medium text-gray-900">
                  Tidak Penting & Tidak Mendesak
                </p>
                <p className="text-sm text-gray-600">
                  Tugas yang bisa dieliminasi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <p className="font-medium text-gray-900">
                  Tugas Selesai
                </p>
                <p className="text-sm text-green-600">
                  Tugas yang sudah diselesaikan
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {events.length}
              </p>
              <p className="text-sm text-gray-600">
                Tugas Aktif
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {completedEvents.length}
              </p>
              <p className="text-sm text-gray-600">
                Tugas Selesai
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {events.length + completedEvents.length}
              </p>
              <p className="text-sm text-gray-600">
                Total Tugas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}