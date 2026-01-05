# 🚀 Beris Rider - Operasional Tasikmalaya

Sistem manajemen ojek lokal cerdas berbasis AI untuk Kota Tasikmalaya.

## ✨ Fitur Utama

- **AI Smart Search**: Cari lokasi jemput/tujuan pakai bahasa sehari-hari.
- **Mobile First UI**: Navigasi bawah ala aplikasi ride-sharing profesional.
- **Admin Dashboard**: Monitoring armada dan tips operasional berbasis AI.
- **Driver Hub**: Catat pengeluaran (BBM/Parkir) dan konfirmasi WhatsApp otomatis.

## 🛠️ Langkah Deploy ke Vercel

1. **Push ke GitHub**:

   - `git init`
   - `git add .`
   - `git commit -m "deployment"`
   - `git push origin main`

2. **Setup Vercel**:
   - Import repository di Vercel.
   - Tambahkan Environment Variable: `API_KEY` (Isi dengan Gemini API Key).
   - Klik Deploy.

## ⚠️ Catatan Penting

Versi saat ini menggunakan `localStorage`. Data tersimpan secara lokal di browser masing-masing. Untuk penggunaan operasional asli dengan banyak driver, diperlukan integrasi Firebase/Supabase yang akan dilakukan di tahap berikutnya.

---

_Dibuat dengan ❤️ untuk kemajuan transportasi lokal Tasikmalaya._
