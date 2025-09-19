'use client'
import { useState, FormEvent } from 'react'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface AuthError {
  message: string;
  status?: number;
}

export default function AuthForm({ mode, onSuccess, onError }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
    }

    // Register specific validation
    if (mode === 'register') {
      if (!formData.name) {
        newErrors.name = 'Nama wajib diisi'
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Konfirmasi password wajib diisi'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Password tidak cocok'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      if (mode === 'register') {
        // Register new user
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            }
          }
        })

        if (error) throw error

        if (data.user) {
          // Create user profile in database
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                name: formData.name,
                email: formData.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])

          if (profileError) {
            console.error('Error creating profile:', profileError)
          }

          if (onSuccess) onSuccess()
          if (onError) onError('')
          alert('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.')
        }
      } else {
        // Login existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) throw error

        if (data.user) {
          if (onSuccess) onSuccess()
          if (onError) onError('')
          router.push('/tasks')
        }
      }
    } catch (error: unknown) {
      console.error('Auth error:', error)
      
      let errorMessage = 'Terjadi kesalahan saat autentikasi'
      
      // Type guard untuk memeriksa apakah error memiliki property message
      if (error && typeof error === 'object' && 'message' in error) {
        const authError = error as AuthError;
        
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah'
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Email belum diverifikasi. Silakan cek email Anda'
        } else if (authError.message.includes('User already registered')) {
          errorMessage = 'Email sudah terdaftar'
        } else if (authError.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Password minimal 6 karakter'
        }
      }

      if (onError) onError(errorMessage)
      setErrors({ submit: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }))
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' }
    if (password.length < 4) return { strength: 25, text: 'Lemah', color: 'bg-red-500' }
    if (password.length < 6) return { strength: 50, text: 'Sedang', color: 'bg-yellow-500' }
    if (password.length < 8) return { strength: 75, text: 'Kuat', color: 'bg-blue-500' }
    return { strength: 100, text: 'Sangat Kuat', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ submit: 'Masukkan email untuk reset password' })
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      alert('Email reset password telah dikirim. Silakan cek inbox Anda.')
    } catch (error: unknown) {
      console.error('Reset password error:', error)
      setErrors({ submit: 'Gagal mengirim email reset password' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {errors.submit && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {errors.submit}
          </p>
        </div>
      )}

      {/* Name Field (Register only) */}
      {mode === 'register' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nama Lengkap
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Masukkan nama lengkap"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 ${
                errors.name ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 hover:border-purple-300'
              }`}
            />
            {errors.name && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name}
            </p>
          )}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 ${
              errors.email ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 hover:border-purple-300'
            }`}
          />
          {errors.email && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 ${
              errors.password ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 hover:border-purple-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-purple-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator (Register only) */}
        {mode === 'register' && formData.password && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Kekuatan Password</span>
              <span className={`font-medium ${
                passwordStrength.strength < 50 ? 'text-red-500' : 
                passwordStrength.strength < 75 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {passwordStrength.text}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: `${passwordStrength.strength}%` }}
              ></div>
            </div>
          </div>
        )}

        {errors.password && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field (Register only) */}
      {mode === 'register' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Konfirmasi Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Ulangi password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 ${
                errors.confirmPassword ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 hover:border-purple-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-purple-600 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Password cocok
            </p>
          )}
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.confirmPassword}
            </p>
          )}
        </div>
      )}

      {/* Remember Me & Forgot Password (Login only) */}
      {mode === 'login' && (
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Ingat saya</span>
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Lupa password?
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {mode === 'login' ? 'Sedang Masuk...' : 'Sedang Daftar...'}
          </>
        ) : (
          mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'
        )}
      </button>
    </form>
  )
}