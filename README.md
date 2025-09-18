# 📘 Planora — Smart Task Management Web App

**Planora** adalah aplikasi manajemen tugas berbasis web yang dirancang untuk membantu pengguna dalam merencanakan, memprioritaskan, dan menyelesaikan aktivitas harian secara efisien. Aplikasi ini menggabungkan fitur checklist interaktif yang terhubung langsung dengan tampilan kalender untuk memantau produktivitas harian secara visual, serta menerapkan *Eisenhower Matrix* agar pengguna dapat menentukan skala prioritas berdasarkan urgensi dan kepentingan.

Selain itu, Planora dilengkapi dengan algoritma *K-Nearest Neighbors (KNN)* untuk mengklasifikasikan tugas berdasarkan deskripsi, tenggat waktu, dan kategori tertentu, sehingga sistem dapat membantu menyarankan atau menyusun tugas secara lebih cerdas. Fitur statistik produktivitas juga tersedia untuk melacak kemajuan pengguna dari waktu ke waktu.

Planora dibangun menggunakan teknologi modern seperti **React**, **TypeScript**, dan **Tailwind CSS** di sisi frontend, serta **Next.js** (App Router) dan **Mongoose** untuk integrasi backend dan database MongoDB. Sistem login dan manajemen sesi telah diterapkan demi menjaga keamanan data pengguna.

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
   MONGODB_URI=your_mongodb_connection_string
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

Planora cocok untuk mahasiswa, freelancer, maupun profesional yang ingin mengelola waktu secara efektif dan terstruktur. Proyek ini masih dalam tahap pengembangan aktif dan terbuka untuk kontribusi. Jika kamu punya ide atau saran, silakan fork repositori dan ajukan *pull request*.

Lisensi: MIT © 2025 Azka Hasyyati Bayan.