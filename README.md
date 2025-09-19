# 📘 Planora — Smart Task Management Web App

**Planora** adalah aplikasi manajemen tugas berbasis web yang dirancang untuk membantu pengguna dalam merencanakan, memprioritaskan, dan menyelesaikan aktivitas harian secara efisien. Aplikasi ini menggabungkan fitur checklist interaktif yang terhubung langsung dengan tampilan kalender untuk memantau produktivitas harian secara visual, serta menerapkan *Eisenhower Matrix* agar pengguna dapat menentukan skala prioritas berdasarkan urgensi dan kepentingan.

Selain itu, Planora dilengkapi dengan algoritma *K-Nearest Neighbors (KNN)* untuk mengklasifikasikan tugas berdasarkan deskripsi, tenggat waktu, dan kategori tertentu, sehingga sistem dapat membantu menyarankan atau menyusun tugas secara lebih cerdas. Fitur statistik produktivitas juga tersedia untuk melacak kemajuan pengguna dari waktu ke waktu.

Planora dibangun menggunakan teknologi modern seperti **React**, **TypeScript**, dan **CSS** di sisi frontend, serta **Next.js** (App Router) dengan **Supabase** sebagai backend untuk autentikasi, database, dan integrasi real-time. Sistem login dan manajemen sesi memanfaatkan layanan Supabase demi menjaga keamanan data pengguna.

---

## 🚀 Cara Menggunakan Planora (Jika Clone dari GitHub)

1. **Clone repositori**

   ```bash
   git clone https://github.com/username/planora.git
   cd planora
   ```

2. **Install dependencies**

   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Siapkan file `.env.local`** dan isi dengan konfigurasi berikut:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Jalankan server pengembangan**

   ```bash
   npm run dev
   ```

5. **Akses aplikasi melalui**

   ```
   http://localhost:3000
   ```

---

Lisensi: MIT © 2025 Kelompok 2