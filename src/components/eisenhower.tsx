'use client'

import { CheckCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  completed?: boolean
  important?: boolean
  urgent?: boolean
}

interface EisenhowerMatrixProps {
  tasks: Task[]
}

export default function EisenhowerMatrix({ tasks }: EisenhowerMatrixProps) {
  const filterTasks = (urgent: boolean, important: boolean) =>
    tasks.filter((task) => task.urgent === urgent && task.important === important)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-4">
      <MatrixCell
        title="Penting & Mendesak"
        tasks={filterTasks(true, true)}
        color="bg-red-100 dark:bg-red-900/30"
        borderColor="border-red-300 dark:border-red-700"
      />
      <MatrixCell
        title="Penting tapi Tidak Mendesak"
        tasks={filterTasks(false, true)}
        color="bg-yellow-100 dark:bg-yellow-900/20"
        borderColor="border-yellow-300 dark:border-yellow-600"
      />
      <MatrixCell
        title="Tidak Penting tapi Mendesak"
        tasks={filterTasks(true, false)}
        color="bg-orange-100 dark:bg-orange-900/30"
        borderColor="border-orange-300 dark:border-orange-600"
      />
      <MatrixCell
        title="Tidak Penting & Tidak Mendesak"
        tasks={filterTasks(false, false)}
        color="bg-gray-100 dark:bg-gray-800"
        borderColor="border-gray-300 dark:border-gray-700"
      />
    </div>
  )
}

function MatrixCell({
  title,
  tasks,
  color,
  borderColor,
}: {
  title: string
  tasks: Task[]
  color: string
  borderColor: string
}) {
  return (
    <div
      className={`rounded-2xl p-5 border shadow-sm transition-all hover:shadow-lg ${color} ${borderColor}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada tugas di sini.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`flex items-center gap-2 text-sm transition-all ${
                task.completed
                  ? 'text-gray-400 line-through dark:text-gray-500'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {task.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
              {task.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}