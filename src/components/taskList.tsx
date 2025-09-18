'use client'

import { CheckCircle, Trash2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  completed?: boolean
}

interface TaskListProps {
  tasks: Task[]
  onDelete: (id: string) => void
  onUpdate: (task: Task) => void
}

export default function TaskList({ tasks, onDelete, onUpdate }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Tidak ada tugas untuk ditampilkan.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800 rounded-2xl p-5 shadow-md flex justify-between items-start transition-all duration-200 hover:shadow-lg"
        >
          {/* Task Info */}
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold transition-all ${
                task.completed
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-800 dark:text-white'
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 items-center ml-4">
            <button
              onClick={() => onUpdate({ ...task, completed: !task.completed })}
              title={task.completed ? 'Tandai sebagai belum selesai' : 'Tandai sebagai selesai'}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              title="Hapus tugas"
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}