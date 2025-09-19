'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { PriorityLevel } from '@/lib/models/task';

interface TaskFormProps {
  onSubmit: (task: { title: string; description: string; priority?: PriorityLevel }) => void;
  onCancel?: () => void;
  initialData?: {
    title: string;
    description: string;
    priority: PriorityLevel;
  };
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<PriorityLevel>(initialData?.priority || PriorityLevel.LOW);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { title?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Judul tugas wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority(PriorityLevel.LOW);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Judul Tugas <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul tugas..."
          className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
            errors.title
              ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 focus:border-purple-500 bg-white dark:bg-gray-700'
          } dark:text-white dark:border-gray-600`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Deskripsi
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tambahkan deskripsi tugas (opsional)..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prioritas
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: PriorityLevel.HIGH, label: 'Tinggi', color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' },
            { value: PriorityLevel.MEDIUM, label: 'Sedang', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800' },
            { value: PriorityLevel.LOW, label: 'Rendah', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPriority(option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                priority === option.value
                  ? `${option.color} ring-2 ring-offset-2 ring-opacity-50 ${
                      option.value === PriorityLevel.HIGH ? 'ring-red-500' :
                      option.value === PriorityLevel.MEDIUM ? 'ring-yellow-500' :
                      'ring-green-500'
                    }`
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <X size={16} />
            Batal
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Save size={16} />
          {initialData ? 'Update Tugas' : 'Tambah Tugas'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;