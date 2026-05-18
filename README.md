# 🎓 Kerja Praktik Universitas Pancasila

Portal resmi untuk pengelolaan dan informasi Kerja Praktik (KP) bagi mahasiswa Teknik Informatika Universitas Pancasila. Aplikasi ini memudahkan mahasiswa dalam mendaftar, memantau status KP, serta mengakses informasi penting lainnya.

Dibangun dengan **React**, **TypeScript**, dan **React Router v7** dengan arsitektur modular yang rapi dan mudah dikembangkan.

📄 **[Lihat Dokumentasi Fitur Lengkap](./FEATURES.md)** (termasuk Live Chat)

---

## 🚀 Getting Started

### 📦 Installation

```bash
npm install
# or
yarn install
```

### 🧪 Run the App

```bash
npm run dev
# or
yarn dev
```

### 🔨 Build for Production

```bash
npm run build
# or
yarn build
```

### 🌐 Tech Stack

- ⚛️ **React**
- 🔀 **React Router v7**
- 🧠 **TypeScript**
- 🎨 **Tailwind CSS** (via Shadcn/UI)
- 🧩 **Modular Architecture**

### 🗂️ Project Structure

Hanya menampilkan struktur folder utama yang relevan dengan sistem Kerja Praktik (mengecualikan modul legacy).

```bash
skripsi-fe/
├── app/
│   ├── components/             # Komponen UI global (Button, Card, dll)
│   ├── features/               # Modul fungsional aplikasi
│   │   ├── landing/            # Fitur halaman depan (Landing Page)
│   │   │   ├── home/           # Komponen Beranda, FAQ, Guide, Schedule
│   │   │   ├── Article/        # Komponen Artikel/Berita
│   │   │   └── ...
│   │   └── ...
│   ├── routes/                 # File Rute (Pages)
│   │   ├── admin/              # Dashboard Admin
│   │   ├── writer/             # Dashboard Penulis/Dosen
│   │   ├── landing/            # Halaman Publik (Home, FAQ, Requirements)
│   │   ├── login/              # Halaman Login
│   │   └── ...
│   ├── lib/
│   │   └── utils.ts            # Fungsi utilitas global
│   └── root.tsx                # Entry point aplikasi
└── ...
```

### 🧭 Routing

Project ini menggunakan **React Router v7**. Semua rute didefinisikan dalam folder `app/routes/` yang secara otomatis memetakan URL ke komponen halaman yang sesuai.

---
---
**Catatan Penting**: Folder seperti `Mining`, `Nickel`, atau module lain yang tidak relevan dengan sistem Kerja Praktik adalah legacy code dan tidak digunakan dalam flow utama aplikasi ini.

### 🤖 Gemini AI Assistant
Aplikasi ini dilengkapi dengan Asisten AI (Gemini 1.5 Flash) untuk membantu pengguna publik di halaman landing.
- **Rute Backend**: `app/routes/api.chat.ts` (Resource Route)
- **Komponen**: `app/components/template/LandingChat.tsx`
- **Konfigurasi**: Memerlukan `GEMINI_API_KEY` di file `.env`.
- **Fitur**: AI dibatasi hanya untuk menjawab seputar informasi Kerja Praktik guna menjaga relevansi dan keamanan penggunaan kuota.

