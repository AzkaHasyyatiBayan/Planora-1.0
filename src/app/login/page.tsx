'use client'
import AuthForm from '@/components/authForm'
import { LogIn, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[var(--purple-primary)] hover:text-[var(--purple-secondary)] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--purple-primary)] px-8 py-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Selamat Datang Kembali!
            </h1>
            <p className="text-white/80">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            <AuthForm mode="login" />
            
            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-[var(--card-border)]"></div>
              <span className="px-4 text-sm text-[var(--foreground-muted)]">atau</span>
              <div className="flex-1 border-t border-[var(--card-border)]"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-background)] hover:shadow-md transition-all duration-200">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                <span className="text-[var(--foreground)]">Lanjutkan dengan Google</span>
              </button>
              
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-background)] hover:shadow-md transition-all duration-200">
                <div className="w-5 h-5 bg-gradient-to-r from-gray-800 to-gray-900 rounded"></div>
                <span className="text-[var(--foreground)]">Lanjutkan dengan GitHub</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-[var(--foreground-muted)]">
                Belum punya akun?{' '}
                <Link 
                  href="/register" 
                  className="text-[var(--purple-primary)] hover:text-[var(--purple-secondary)] font-semibold transition-colors"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--foreground-muted)]">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Aman dan terpercaya</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-[var(--purple-primary)] rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-pulse pointer-events-none"></div>
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-[var(--indigo-primary)] rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-pulse pointer-events-none" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  )
}