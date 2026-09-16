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
│   ├── api/                    # Integrasi API & Centralized Types
│   │   ├── client.ts           # Axios Client / Base URL
│   │   ├── types.ts            # Centralized Single Source of Truth for Types
│   │   └── ...Api.ts           # Endpoint Services (userApi, bimbinganApi, dll)
│   ├── components/             # Komponen UI global (Button, Card, CustomSelect, dll)
│   ├── features/               # Pure Declarative UI Components (Desktop & Mobile)
│   │   ├── admin/              # Dashboard Admin & Monitoring
│   │   ├── dosen/              # Modul Dosen, Penilaian, Peninjauan, Sanksi, Prodi
│   │   ├── mahasiswa/          # Dashboard Mahasiswa, Pengajuan, Logbook, Sidang
│   │   ├── chat/               # Live Chat & Group Messaging
│   │   └── landing/            # Landing Page & Publik Info
│   ├── hooks/                  # Centralized Custom Hooks Registry (`use*.ts`)
│   │   ├── index.ts            # Centralized Export Registry for Hooks
│   │   ├── useAuth.ts          # Authentication State
│   │   ├── useCreateAccount.ts # Admin Account Creation State & Validation
│   │   ├── useEditAccount.ts   # Admin Account Editing State
│   │   ├── useProdiBimbingan.ts# Prodi & Admin Monitoring Bimbingan & PDF Export
│   │   ├── useProdiSidang.ts   # Prodi Sidang Monitoring
│   │   ├── useBimbingan.ts     # Dosen & Mahasiswa Bimbingan
│   │   ├── usePeninjauan.ts    # Dosen Peninjauan Pengajuan
│   │   ├── usePenilaian.ts     # Dosen Penilaian Sidang
│   │   ├── useSanksi.ts        # Dosen & Admin Sanksi Administrasi
│   │   ├── useLaporan.ts       # Dosen Laporan Akhir
│   │   └── useChat.ts          # Realtime Live Chat & Socket.IO
│   ├── routes/                 # File Rute (Pages) & Route Guards
│   └── root.tsx                # Entry point aplikasi
└── ...
```

---

## 🏗️ Standar Arsitektur & Clean Code

Aplikasi ini menerapkan prinsip **Clean Code** & **Decoupled Architecture**:

### 1. 🪝 Centralized Hooks Registry (`app/hooks/`)
Seluruh logika bisnis (*state*, *effects*, kalkulasi, fetching, validasi, dan ekspor) dipisahkan dari komponen UI dan dipusatkan dalam folder `app/hooks/`.
- Komponen UI (seperti `ProdiBimbingan.tsx`, `MonitoringDesktop.tsx`, `CreateAccountDesktop.tsx`) bersifat deklaratif dan hanya mengonsumsi hook.
- Seluruh hook diekspor kembali secara terpusat melalui `app/hooks/index.ts`.
- Seluruh file mengimpor hook menggunakan **Path Alias** `~/hooks` (contoh: `import { useProdiBimbingan } from "~/hooks/useProdiBimbingan"`).

### 2. 📘 Centralized Types Definition (`app/api/types.ts`)
Seluruh tipe TypeScript (*interfaces* dan *types*) untuk DTO API, data pengguna, *form state*, *props*, dan entitas bisnis dipusatkan dalam satu file utama: `app/api/types.ts`.
- Menghindari percampuran tipe antar folder modul.
- Menjamin konsistensi tipe di seluruh komponen (Mahasiswa, Dosen, Admin, Prodi, dan Staf).

### 3. 🖥️📱 Pemisahan Tampilan Desktop & Mobile (Decoupled Layout Rendering)
Aplikasi ini secara konsisten memisahkan komponen antarmuka antara tampilan **Desktop** (`*Desktop.tsx`) dan **Mobile** (`*Mobile.tsx`) untuk setiap modul fitur (seperti *Laporan*, *Bimbingan*, *Penilaian*, *Peninjauan*, *Sanksi*, *Prodi*, *Acara*, dan *Create Account*).
- **Dirender secara terpisah di tingkat Rute**: Pada file rute (`app/routes/`), aplikasi mendeteksi tipe layar (misalnya menggunakan hook media query `isMobile` / `useMediaQuery` atau layout switcher) dan secara eksplisit merender komponen yang sesuai (`LaporanDesktop` atau `LaporanMobile`).
- **Keuntungan Utama**:
  1. **Kode Lebih Bersih & Deklaratif**: Menghindari penggabungan class CSS responsif yang rumit (`hidden md:block flex-col md:flex-row`) dalam satu file komponen yang besar.
  2. **Pengalaman Pengguna (UX) Maksimal**: Desain Desktop menggunakan layout tabel/grid komprehensif, sedangkan Mobile menggunakan antarmuka berbasis card-list yang dioptimalkan untuk gesture layar sentuh.
  3. **Shared Business Logic (Single Source of Truth)**: Komponen Desktop dan Mobile **berbagi satu hook terpusat yang sama** (seperti `useLaporan()`, `useBimbingan()`, `usePenilaian()`, `useSanksi()`), sehingga seluruh *state*, fetching API, pagination, dan kalkulasi data dijamin 100% konsisten.

---

## 📊 Monitoring Bimbingan (Prodi & Admin Parity)

Modul **Monitoring Bimbingan** digunakan oleh **Admin** dan **Ketua Program Studi (Prodi)** untuk memantau progres bimbingan mahasiswa dan dosen secara real-time.

### 🌟 Fitur Utama:
1. **Perhitungan Skor Kedisiplinan Progres**:
   - Menghitung progres berbasis fuzzy-match topik bimbingan (Bab 1 s.d. Laporan Akhir).
   - Memberikan bonus skor progres untuk bimbingan yang telah disetujui (`APPROVED`).
2. **Riwayat Detail Bimbingan (Drill-Down)**:
   - Melihat daftar mahasiswa bimbingan per dosen.
   - Menelusuri seluruh versi draft laporan mahasiswa beserta catatan dan reviu dosen.
3. **Ekspor Laporan PDF Formal (Landscape Format)**:
   - Mendukung ekspor **PDF Per Dosen** maupun **PDF Keseluruhan (Semua Dosen)**.
   - Menggunakan format tabel landscape yang rapi mencakup: *No, Bab / Topik, Status, Tanggal Reviu, Jumlah Bimbingan,* dan *Catatan Dosen*.

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

---

## 📅 Manajemen Jadwal & Sidang (Schedule Management)

Modul terpusat bagi Staf / Prodi untuk mengelola seluruh jadwal penting terkait alur Kerja Praktik dan Sidang. Sistem ini dipecah menjadi 3 sub-modul (Tabbing) untuk memisahkan konteks pengelolaan namun tetap berada dalam satu halaman dashboard yang praktis.

### 📑 3 Kategori Jadwal Utama
1. **Pengarahan KP**
   - Menampilkan agenda sosialisasi dan pengarahan umum Kerja Praktik.
   - Digunakan sebagai portal informasi satu arah dari prodi ke seluruh mahasiswa.
2. **Pengumpulan Sidang**
   - Mendefinisikan periode (timeline) pendaftaran sidang.
   - Digunakan untuk mengingatkan mahasiswa batas waktu (*deadline*) pengumpulan berkas dan pendaftaran sidang.
3. **Jadwal Sidang (Plotting)**
   - Manajemen plotting spesifik bagi mahasiswa yang telah di-ACC untuk maju sidang.
   - Admin/Staf menentukan lokasi ruangan, tanggal, waktu, serta menugaskan dosen penguji (*Examiner Assignment*).

### ⚙️ Alur Kerja (Workflow)
- Form pembuatan dan pembaruan (*Create/Update*) telah dipisahkan menjadi rute halaman mandiri (`jadwal.create.tsx` dan `jadwal.edit.$id.tsx`) guna menghindari konflik render pada antarmuka *modal* (*Popup bug prevention*).
- Komponen menggunakan *pure Tailwind CSS* untuk tata letak modern dan *Shadcn UI* (komponen `<Button>`, `<Input>`) untuk konsistensi desain sistem.

---

## 📝 Penilaian Evaluasi Kerja Praktik (Grading Rules & Access Boundaries)

Modul ini mengelola penilaian akhir kerja praktik mahasiswa berdasarkan evaluasi dari Dosen Pembimbing (P1) dan Dosen Penguji (P2).

### 👥 Peran & Batasan Akses (Roles & Permissions)
1. **Dosen Pembimbing (P1)**:
   - Menginput nilai komponen bimbingan (K1, K2, K3) dengan pembobotan **35%, 30%, 35%**.
   - Input nilai Dosen Penguji (P2) dikunci (read-only) untuk mencegah manipulasi.
2. **Dosen Penguji (P2)**:
   - Menginput nilai komponen ujian (K1, K2, K3) dengan pembobotan **35%, 30%, 35%**.
   - Input nilai Dosen Pembimbing (P1) dikunci (read-only) untuk mencegah manipulasi.
3. **Admin / Staf**:
   - Hanya memiliki wewenang untuk menugaskan Dosen Penguji (bulk examiner assignment).
   - Seluruh tab penilaian pribadi ("Bimbingan Saya", "Diuji Oleh Saya") disembunyikan untuk Admin.
   - Form penilaian bersifat **read-only** (tidak dapat mengisi nilai P1 maupun P2).

### 📊 Skala Konversi Huruf Mutu (Grading Scale)
Rata-rata akhir dihitung dari gabungan total P1 dan P2 dibagi 2, lalu dikonversi dengan skala berikut:
*   `Nilai >= 80` ➔ **A**
*   `Nilai >= 70` ➔ **B**
*   `Nilai >= 60` ➔ **B-**
*   `Nilai >= 50` ➔ **C**
*   `Nilai >= 40` ➔ **C-**
*   `Nilai < 40` ➔ **D**

---

## ⚠️ Sanksi Administrasi (Administrative Sanctions & Fine Rules)

Modul ini mengelola penerbitan, peninjauan, dan pencetakan dokumen formal **Surat Pernyataan Sanksi Administrasi** bagi mahasiswa yang terlambat mengumpulkan berkas Kerja Praktik dalam bentuk hardcover setelah Sidang Evaluasi KP.

### 👥 Peran & Batasan Akses (Roles & Permissions)
1. **Dosen Pembimbing, Kaprodi, Staff, & Admin**:
   - Memiliki hak akses penuh untuk membuat (*create*), mengedit (*update*), menghapus (*delete*), dan melihat (*read*) sanksi administrasi.
   - Dapat mencetak pratinjau Surat Pernyataan dari mahasiswa terkait.
   - Admin, Staff, dan Kaprodi memiliki akses koordinasi penuh untuk menerbitkan sanksi kepada semua mahasiswa yang telah disetujui judulnya.
2. **Mahasiswa**:
   - Hanya memiliki hak akses baca (*read-only*) untuk melihat sanksi administrasi yang diterbitkan untuk dirinya.
   - Dilengkapi dengan **notifikasi badge merah** di sidebar menu jika ada sanksi aktif.
   - Dapat mencetak langsung Surat Pernyataan resmi untuk ditempeli meterai Rp 10.000.

### 💸 Aturan Akumulasi Denda Keterlambatan (Fine Rules)
Berdasarkan ketentuan formal Kerja Praktik:
*   Keterlambatan 1 (satu) minggu pertama setelah tanggal Sidang KP: denda sebesar **Rp. 50.000,- (Lima Puluh Ribu Rupiah)**.
*   Keterlambatan setiap minggu berikutnya: denda tambahan sebesar **Rp. 50.000,-** per minggu.
*   Maksimal akumulasi denda denda: **Rp. 200.000,- (Dua Ratus Ribu Rupiah)**.

### 🖨️ Desain & Pencetakan Dokumen
- Surat Pernyataan dirancang dengan format dokumen hukum formal (kop surat tengah, grid identitas mahasiswa, list poin ketentuan, kolom tanggal, stamp kotak meterai, dan kolom tanda tangan).
- Fitur cetak diimplementasikan menggunakan **Pure Tailwind CSS print modifiers** (`print:w-full`, `print:hidden`, `print:shadow-none`, `print:border-none`, dll) untuk menjamin hasil cetak bersih (tanpa header web/sidebar) dan bebas dari pemotongan kertas (*page cut-off*).

### 🔌 API Endpoints Documentation
Seluruh endpoint di bawah ini memerlukan header autentikasi: `Authorization: Bearer <token_jwt>`.

#### 1. Get All Sanksi
Mendapatkan daftar sanksi administrasi.
- **Endpoint**: `/api/sanksi`
- **Method**: `GET`
- **Akses & Logika**:
  - `MAHASISWA`: Mengembalikan daftar sanksi milik mahasiswa yang bersangkutan.
  - `DOSEN`: Mengembalikan daftar sanksi yang diterbitkan oleh dosen tersebut.
  - `ADMIN`, `STAF`, `KAPRODI`: Mengembalikan seluruh sanksi administrasi di sistem.
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "mahasiswaId": 5,
      "dosenId": 2,
      "nama": "Dhandi",
      "nim": "4520210001",
      "hariSidang": "Senin",
      "tanggalSidang": "15 Juni 2026",
      "hariTenggat": "Senin",
      "tanggalSurat": "15 Juni 2026",
      "createdAt": "2026-06-15T12:00:00.000Z",
      "updatedAt": "2026-06-15T12:00:00.000Z",
      "mahasiswa": {
        "id": 5,
        "nama": "Dhandi",
        "nim": "4520210001",
        "jurusan": "Teknik Informatika"
      },
      "dosen": {
        "id": 2,
        "nama": "Dr. Dosen",
        "nidn": "0412345678"
      }
    }
  ]
  ```

#### 2. Get Supervised Students
Mendapatkan daftar mahasiswa bimbingan yang telah disetujui Kerja Praktik-nya untuk pilihan penerbitan sanksi.
- **Endpoint**: `/api/sanksi/students`
- **Method**: `GET`
- **Akses & Logika**:
  - `DOSEN`: Mengembalikan mahasiswa bimbingan dari dosen yang sedang login.
  - `ADMIN`, `STAF`, `KAPRODI`: Mengembalikan seluruh mahasiswa yang memiliki status pengajuan KP disetujui (`APPROVED`).
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 5,
      "nama": "Dhandi",
      "nim": "4520210001",
      "jurusan": "Teknik Informatika"
    }
  ]
  ```

#### 3. Create Sanksi
Menerbitkan sanksi administrasi baru untuk mahasiswa.
- **Endpoint**: `/api/sanksi`
- **Method**: `POST`
- **Request Body (JSON)**:
  ```json
  {
    "mahasiswaId": 5,
    "nama": "Dhandi",
    "nim": "4520210001",
    "hariSidang": "Senin",
    "tanggalSidang": "15 Juni 2026",
    "hariTenggat": "Senin",
    "tanggalSurat": "15 Juni 2026"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "mahasiswaId": 5,
    "dosenId": 2,
    "nama": "Dhandi",
    "nim": "4520210001",
    "hariSidang": "Senin",
    "tanggalSidang": "15 Juni 2026",
    "hariTenggat": "Senin",
    "tanggalSurat": "15 Juni 2026",
    "createdAt": "2026-06-15T12:00:00.000Z",
    "updatedAt": "2026-06-15T12:00:00.000Z"
  }
  ```

#### 4. Update Sanksi
Mengubah data sanksi administrasi yang telah diterbitkan.
- **Endpoint**: `/api/sanksi/:id`
- **Method**: `PUT`
- **Request Body (JSON)**:
  ```json
  {
    "nama": "Dhandi (Updated)",
    "nim": "4520210001",
    "hariSidang": "Selasa",
    "tanggalSidang": "16 Juni 2026",
    "hariTenggat": "Selasa",
    "tanggalSurat": "16 Juni 2026"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "mahasiswaId": 5,
    "dosenId": 2,
    "nama": "Dhandi (Updated)",
    "nim": "4520210001",
    "hariSidang": "Selasa",
    "tanggalSidang": "16 Juni 2026",
    "hariTenggat": "Selasa",
    "tanggalSurat": "16 Juni 2026",
    "createdAt": "2026-06-15T12:00:00.000Z",
    "updatedAt": "2026-06-15T12:30:00.000Z"
  }
  ```

#### 5. Delete Sanksi
Menghapus sanksi administrasi dari sistem.
- **Endpoint**: `/api/sanksi/:id`
- **Method**: `DELETE`
- **Response (200 OK)**:
  ```json
  {
    "message": "Sanksi Administrasi deleted successfully"
  }


---

## 📑 Modul Laporan Akhir Bimbingan

Modul Laporan Akhir Bimbingan memuat rekapitulasi data mahasiswa bimbingan yang telah disetujui judulnya, termasuk progres logbook, rincian nilai pembimbing (P1: K1, K2, K3), nilai penguji (P2: K1, K2, K3), Nilai Akhir, dan Huruf Mutu.

### 📱 Arsitektur Terpisah (Desktop & Mobile Parity)
- **Desktop Component** (`LaporanDesktop.tsx`):
  - Tampilan tabel komprehensif dengan kolom yang disesuaikan (Nama/NIM & Nilai Dosen proporsional, Logbook ramping).
  - Menggunakan komponen UI terstandarisasi `Button` untuk ekspor CSV & PDF.
  - Teks nama mahasiswa dan detail nilai dirancang sedang & kontras agar nyaman dibaca.
- **Mobile Component** (`LaporanMobile.tsx`):
  - Tampilan card list responsif yang dioptimalkan untuk perangkat layar sentuh.
  - Menggunakan komponen `Button` UI resmi untuk tombol ekspor dan navigasi.
- **Shared Hook** (`useLaporan.ts`):
  - Seluruh logika fetching data laporan, filtering pencarian, pagination, ekspor CSV, dan pencetakan PDF dipusatkan dalam satu custom hook.
- **Cetak Laporan PDF Document** (`CetakLaporanDocument.tsx`):
  - Dokumen khusus cetak resmi A4.
  - Memastikan **tanda tangan dan paraf dosen pembimbing hanya tampil jika berupa image URL valid**, dan dibiarkan kosong bersih jika belum ada (tanpa font cursive buatan/palsu).


