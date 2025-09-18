'use client'

import { useState, FormEvent } from 'react'
import { ClipboardPlus } from 'lucide-react'
import { PriorityLevel } from '@/lib/models/task'

interface TaskFormProps {
  onSubmit?: (task: { title: string; description: string; priority?: PriorityLevel }) => void
}

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.LOW)
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Judul tugas wajib diisi')
      return
    }
    setError('')
    
    // Safety check untuk onSubmit
    if (typeof onSubmit === 'function') {
      onSubmit({ title, description, priority })
      setTitle('')
      setDescription('')
      setPriority(PriorityLevel.LOW)
    } else {
      console.warn('onSubmit prop is not a function or not provided')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-purple-100 dark:border-purple-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ClipboardPlus className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">Tambah Tugas Baru</h2>
        <p className="text-purple-100 text-sm">Isi form berikut untuk menambahkan tugas ke daftar Anda</p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Judul Tugas</label>
          <input
            type="text"
            placeholder="Masukkan judul tugas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 ${
              error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 hover:border-purple-300'
            }`}
            required
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi (Opsional)</label>
          <textarea
            placeholder="Tuliskan deskripsi detail tugas (jika perlu)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 hover:border-purple-300"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prioritas</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value={PriorityLevel.LOW}>Rendah</option>
            <option value={PriorityLevel.MEDIUM}>Sedang</option>
            <option value={PriorityLevel.HIGH}>Tinggi</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
        >
          Tambah Tugas
        </button>
      </form>
    </div>
  )
}