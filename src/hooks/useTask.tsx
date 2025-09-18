//
'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'

interface Task {
  _id: string
  title: string
  description?: string
  isCompleted?: boolean
  important?: boolean
  urgent?: boolean
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  tags?: string[]
  assignedTo?: string
  category?: string
}

interface TaskFilters {
  status?: Task['status']
  priority?: Task['priority']
  completed?: boolean
  important?: boolean
  urgent?: boolean
  category?: string
  search?: string
  dateRange?: {
    start: string
    end: string
  }
}

interface TaskStats {
  total: number
  completed: number
  pending: number
  important: number
  urgent: number
  overdue: number
  completionRate: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  byCategory: Record<string, number>
}

interface UseTasksReturn {
  // Data
  tasks: Task[]
  filteredTasks: Task[]
  stats: TaskStats
  
  // Loading states
  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
  
  // Error handling
  error: string | null
  
  // CRUD operations
  createTask: (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Task | null>
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>
  deleteTask: (id: string) => Promise<boolean>
  duplicateTask: (id: string) => Promise<Task | null>
  
  // Bulk operations
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => Promise<boolean>
  bulkDeleteTasks: (ids: string[]) => Promise<boolean>
  markAllAsCompleted: () => Promise<boolean>
  deleteCompletedTasks: () => Promise<boolean>
  
  // Filtering and sorting
  filters: TaskFilters
  setFilters: (filters: Partial<TaskFilters>) => void
  clearFilters: () => void
  sortBy: 'title' | 'createdAt' | 'dueDate' | 'priority' | 'status'
  setSortBy: (sort: UseTasksReturn['sortBy']) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (order: 'asc' | 'desc') => void
  
  // Utility functions
  refreshTasks: () => Promise<void>
  getTaskById: (id: string) => Task | undefined
  getTasksByCategory: (category: string) => Task[]
  getOverdueTasks: () => Task[]
  getTasksForToday: () => Task[]
  getTasksForWeek: () => Task[]
  
  // Local storage sync
  syncWithLocalStorage: boolean
  setSyncWithLocalStorage: (sync: boolean) => void
}

export default function useTasks(options?: {
  autoRefresh?: boolean
  refreshInterval?: number
  syncWithLocalStorage?: boolean
  enableOptimisticUpdates?: boolean
}): UseTasksReturn {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    syncWithLocalStorage = true,
    enableOptimisticUpdates = true
  } = options || {}

  // State management
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<TaskFilters>({})
  const [sortBy, setSortBy] = useState<UseTasksReturn['sortBy']>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [syncWithLocalStorageState, setSyncWithLocalStorage] = useState(syncWithLocalStorage)

  // Local storage key
  const LOCAL_STORAGE_KEY = 'tasks_cache'

  // Load tasks from localStorage on mount
  useEffect(() => {
    if (syncWithLocalStorageState) {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (cached) {
          const cachedTasks = JSON.parse(cached)
          setTasks(cachedTasks)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error)
      }
    }
  }, [syncWithLocalStorageState])

  // Sync tasks to localStorage whenever tasks change
  useEffect(() => {
    if (syncWithLocalStorageState && tasks.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks))
      } catch (error) {
        console.error('Failed to save tasks to localStorage:', error)
      }
    }
  }, [tasks, syncWithLocalStorageState])

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/tasks', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      setTasks(data)
      
      // Update localStorage
      if (syncWithLocalStorageState) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengambil data tugas'
      setError(errorMessage)
      console.error('Failed to fetch tasks:', error)
      console.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [syncWithLocalStorageState])

  // Initial fetch
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchTasks, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchTasks])

  // CRUD Operations
  const createTask = useCallback(async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> => {
    try {
      setCreating(true)
      setError(null)

      // Optimistic update
      const tempTask: Task = {
        ...taskData,
        _id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (enableOptimisticUpdates) {
        setTasks(prev => [...prev, tempTask])
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const newTask = await res.json()

      // Replace temp task with real task
      setTasks(prev => enableOptimisticUpdates 
        ? prev.map(task => task._id === tempTask._id ? newTask : task)
        : [...prev, newTask]
      )

      console.log('Task berhasil dibuat!')
      return newTask
    } catch (error) {
      // Rollback optimistic update
      if (enableOptimisticUpdates) {
        setTasks(prev => prev.filter(task => !task._id.startsWith('temp_')))
      }

      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat task'
      setError(errorMessage)
      console.error(errorMessage)
      return null
    } finally {
      setCreating(false)
    }
  }, [enableOptimisticUpdates])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    let originalTask: Task | undefined
    try {
      setUpdating(true)
      setError(null)

      // Optimistic update
      originalTask = tasks.find(task => task._id === id)
      if (!originalTask) {
        throw new Error('Task not found')
      }

      const updatedTask = { ...originalTask, ...updates, updatedAt: new Date().toISOString() }

      if (enableOptimisticUpdates) {
      setTasks(prev => prev.map(task => task._id === id ? updatedTask : task))
      }

      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const serverTask = await res.json()

      // Update with server response
      setTasks(prev => prev.map(task => task._id === id ? serverTask : task))

      console.log('Task berhasil diupdate!')
      return serverTask
    } catch (error) {
      // Rollback optimistic update
      if (enableOptimisticUpdates && originalTask) {
        setTasks(prev => prev.map(task => task._id === id ? originalTask : task))
      }

      const errorMessage = error instanceof Error ? error.message : 'Gagal mengupdate task'
      setError(errorMessage)
      console.error(errorMessage)
      return null
    } finally {
      setUpdating(false)
    }
  }, [tasks, enableOptimisticUpdates])

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    let taskToDelete: Task | undefined
    try {
      setDeleting(true)
      setError(null)

      // Optimistic update
      taskToDelete = tasks.find(task => task._id === id)
      if (enableOptimisticUpdates) {
        setTasks(prev => prev.filter(task => task._id !== id))
      }

      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      // Confirm deletion
      if (!enableOptimisticUpdates) {
        setTasks(prev => prev.filter(task => task._id !== id))
      }

      console.log('Task berhasil dihapus!')
      return true
    } catch (error) {
      // Rollback optimistic update
      if (enableOptimisticUpdates && taskToDelete) {
        setTasks(prev => [...prev, taskToDelete])
      }

      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus task'
      setError(errorMessage)
      console.error(errorMessage)
      return false
    } finally {
      setDeleting(false)
    }
  }, [tasks, enableOptimisticUpdates])

  const duplicateTask = useCallback(async (id: string): Promise<Task | null> => {
    const originalTask = tasks.find(task => task._id === id)
    if (!originalTask) {
      console.error('Task tidak ditemukan')
      return null
    }

    const { _id, createdAt, updatedAt, ...taskData } = originalTask
    const duplicatedTask = {
      ...taskData,
      title: `${taskData.title} (Copy)`,
    }

    return createTask(duplicatedTask)
  }, [tasks, createTask])

  // Bulk operations
  const bulkUpdateTasks = useCallback(async (ids: string[], updates: Partial<Task>): Promise<boolean> => {
    try {
      setUpdating(true)
      setError(null)

      const res = await fetch('/api/tasks/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, updates }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      // Update local state
      setTasks(prev => prev.map(task => 
        ids.includes(task._id) 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ))

      console.log(`${ids.length} task berhasil diupdate!`)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengupdate tasks'
      setError(errorMessage)
      console.error(errorMessage)
      return false
    } finally {
      setUpdating(false)
    }
  }, [])

  const bulkDeleteTasks = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      setDeleting(true)
      setError(null)

      const res = await fetch('/api/tasks/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      // Update local state
      setTasks(prev => prev.filter(task => !ids.includes(task._id)))

      console.log(`${ids.length} task berhasil dihapus!`)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus tasks'
      setError(errorMessage)
      console.error(errorMessage)
      return false
    } finally {
      setDeleting(false)
    }
  }, [])

  const markAllAsCompleted = useCallback(async (): Promise<boolean> => {
    const incompleteTasks = tasks.filter(task => !task.isCompleted)
    if (incompleteTasks.length === 0) {
      console.log('Semua task sudah selesai!')
      return true
    }

    return bulkUpdateTasks(
      incompleteTasks.map(task => task._id),
      { isCompleted: true, status: 'completed' }
    )
  }, [tasks, bulkUpdateTasks])

  const deleteCompletedTasks = useCallback(async (): Promise<boolean> => {
    const completedTasks = tasks.filter(task => task.isCompleted)
    if (completedTasks.length === 0) {
      console.log('Tidak ada task yang selesai!')
      return true
    }

    return bulkDeleteTasks(completedTasks.map(task => task._id))
  }, [tasks, bulkDeleteTasks])

  // Filtering and sorting
  const setFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
  }, [])

  // Memoized filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status)
    }
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }
    if (filters.completed !== undefined) {
      filtered = filtered.filter(task => task.isCompleted === filters.completed)
    }
    if (filters.important !== undefined) {
      filtered = filtered.filter(task => task.important === filters.important)
    }
    if (filters.urgent !== undefined) {
      filtered = filtered.filter(task => task.urgent === filters.urgent)
    }
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        return dueDate >= new Date(start) && dueDate <= new Date(end)
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
          break
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          comparison = aDate - bDate
          break
        case 'priority':
          const priorityOrder: Record<string, number> = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 }
          comparison = (priorityOrder[a.priority || 'low'] || 0) - (priorityOrder[b.priority || 'low'] || 0)
          break
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '')
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [tasks, filters, sortBy, sortOrder])

  // Memoized statistics
  const stats = useMemo((): TaskStats => {
    const total = tasks.length
    const completed = tasks.filter(task => task.isCompleted).length
    const pending = total - completed
    const important = tasks.filter(task => task.important).length
    const urgent = tasks.filter(task => task.urgent).length
    
    const overdue = tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false
      return new Date(task.dueDate) < new Date()
    }).length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const byStatus = tasks.reduce((acc, task) => {
      const status = task.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = tasks.reduce((acc, task) => {
      const priority = task.priority || 'Unknown'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byCategory = tasks.reduce((acc, task) => {
      const category = task.category || 'Uncategorized'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      completed,
      pending,
      important,
      urgent,
      overdue,
      completionRate,
      byStatus,
      byPriority,
      byCategory,
    }
  }, [tasks])

  // Utility functions
  const refreshTasks = useCallback(async () => {
    setLoading(true)
    await fetchTasks()
  }, [fetchTasks])

  const getTaskById = useCallback((id: string) => {
    return tasks.find(task => task._id === id)
  }, [tasks])

  const getTasksByCategory = useCallback((category: string) => {
    return tasks.filter(task => task.category === category)
  }, [tasks])

  const getOverdueTasks = useCallback(() => {
    return tasks.filter(task => {
      if (!task.dueDate || task.isCompleted) return false
      return new Date(task.dueDate) < new Date()
    })
  }, [tasks])

  const getTasksForToday = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate < tomorrow
    })
  }, [tasks])

  const getTasksForWeek = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    return tasks.filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= today && dueDate < weekFromNow
    })
  }, [tasks])

  return {
    // Data
    tasks,
    filteredTasks,
    stats,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    
    // Error handling
    error,
    
    // CRUD operations
    createTask,
    updateTask,
    deleteTask,
    duplicateTask,
    
    // Bulk operations
    bulkUpdateTasks,
    bulkDeleteTasks,
    markAllAsCompleted,
    deleteCompletedTasks,
    
    // Filtering and sorting
    filters,
    setFilters,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    
    // Utility functions
    refreshTasks,
    getTaskById,
    getTasksByCategory,
    getOverdueTasks,
    getTasksForToday,
    getTasksForWeek,
    
    // Local storage sync
    syncWithLocalStorage: syncWithLocalStorageState,
    setSyncWithLocalStorage,
  }
}