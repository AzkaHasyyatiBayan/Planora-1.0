"use client"
import {
  CheckCircle,
  Calendar,
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: CheckCircle,
      title: "Mudah Digunakan",
      description: "Interface yang intuitif untuk mengelola tugas dengan efisien",
    },
    {
      icon: Calendar,
      title: "Penjadwalan",
      description: "Atur deadline dan prioritas tugas dengan mudah",
    },
    {
      icon: Target,
      title: "Pencapaian",
      description: "Lacak progress dan capai target harian Anda",
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Produktivitas Meningkat",
      description: "Tingkatkan efisiensi kerja hingga 40% dengan manajemen tugas yang terstruktur",
      stat: "40%",
      statLabel: "Peningkatan Efisiensi"
    },
    {
      icon: Clock,
      title: "Hemat Waktu",
      description: "Otomatisasi dan prioritas cerdas menghemat waktu Anda untuk hal yang lebih penting",
      stat: "2 Jam",
      statLabel: "Waktu Tersimpan/Hari"
    },
    {
      icon: Zap,
      title: "Fokus Lebih Baik",
      description: "Sistem prioritas membantu Anda fokus pada tugas yang benar-benar penting",
      stat: "85%",
      statLabel: "Tugas Diselesaikan Tepat Waktu"
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-all">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-[var(--purple-primary)] rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[var(--foreground)]">
            Selamat Datang di
            <span className="block mt-2 text-[var(--purple-primary)]">Planora</span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--foreground-muted)] mb-8 max-w-2xl mx-auto leading-relaxed">
            Kelola tugas harian Anda dengan mudah dan efektif. Tingkatkan produktivitas dengan sistem manajemen yang powerful.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-[var(--purple-primary)] text-white px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
              Mulai Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border-2 border-[var(--purple-primary)] text-[var(--purple-primary)] px-8 py-4 rounded-full font-semibold hover:bg-[var(--purple-primary)] hover:text-white transition-all duration-200">
              Pelajari Lebih Lanjut
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8"
              >
                <div className="w-16 h-16 bg-[var(--purple-secondary)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--foreground-muted)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Benefits Section - Updated from Stats */}
        <div className="mt-20 bg-gradient-to-br from-[var(--purple-primary)] to-[var(--purple-secondary)] text-white rounded-3xl p-8 md:p-12 shadow-lg overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 border border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Manfaat Menggunakan Planora
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
                Rasakan perubahan positif dalam cara Anda mengelola tugas dan mencapai tujuan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                      {benefit.stat}
                    </div>
                    <div className="text-sm text-white opacity-80 mb-3 font-medium">
                      {benefit.statLabel}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-white opacity-90 leading-relaxed text-sm">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Additional Benefits */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-medium">
                  Gratis selamanya untuk fitur dasar
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-3xl p-8 md:p-12 shadow-md">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              Siap Meningkatkan Produktivitas?
            </h2>
            <p className="text-lg text-[var(--foreground-muted)] mb-8 max-w-2xl mx-auto">
              Mulai perjalanan Anda menuju manajemen tugas yang lebih efektif hari ini juga.
            </p>
            <button className="bg-[var(--purple-primary)] text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg">
              Coba Gratis Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}