'use client'
import AuthForm from "@/components/authForm"
import { UserPlus, Sparkles, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const benefits = [
    "Gratis selamanya untuk fitur dasar",
    "Sinkronisasi lintas perangkat",
    "Backup otomatis ke cloud"
  ]

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all flex items-center justify-center px-4 py-8">
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

        {/* Register Card */}
        <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--purple-primary)] px-8 py-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bergabung Bersama Kami!
            </h1>
            <p className="text-white/80">
              Buat akun baru dan mulai produktivitas Anda
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            {/* Benefit */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-[var(--purple-primary)]" />
                <span className="font-semibold text-[var(--foreground)]">Keuntungan Bergabung:</span>
              </div>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-[var(--foreground-muted)]">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <AuthForm mode="register" />

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-[var(--card-border)]"></div>
              <span className="px-4 text-sm text-[var(--foreground-muted)]">atau</span>
              <div className="flex-1 border-t border-[var(--card-border)]"></div>
            </div>

            {/* Social Register Buttons */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-background)] hover:shadow-md transition-all duration-200">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded" />
                <span className="text-[var(--foreground)]">Daftar dengan Google</span>
              </button>
              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--card-border)] rounded-xl hover:bg-[var(--card-background)] hover:shadow-md transition-all duration-200">
                <div className="w-5 h-5 bg-gradient-to-r from-gray-800 to-gray-900 rounded" />
                <span className="text-[var(--foreground)]">Daftar dengan GitHub</span>
              </button>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                Dengan mendaftar, Anda menyetujui{' '}
                <Link href="/terms" className="text-[var(--purple-primary)] hover:underline">
                  Syarat & Ketentuan
                </Link>{' '}
                dan{' '}
                <Link href="/privacy" className="text-[var(--purple-primary)] hover:underline">
                  Kebijakan Privasi
                </Link>{' '}
                kami.
              </p>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-[var(--foreground-muted)]">
                Sudah punya akun?{' '}
                <Link 
                  href="/login" 
                  className="text-[var(--purple-primary)] hover:text-[var(--purple-secondary)] font-semibold transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--foreground-muted)]">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Proses pendaftaran hanya 30 detik</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 bg-[var(--purple-primary)] rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-pulse pointer-events-none"></div>
        <div className="fixed bottom-20 right-10 w-40 h-40 bg-[var(--indigo-primary)] rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-20 animate-pulse pointer-events-none" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  )
}