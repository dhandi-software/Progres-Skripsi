# 📝 Dokumentasi API Frontend: Pengajuan Formulir

Dokumen ini menjelaskan alur teknis (step-by-step) dari UI React hingga pengiriman data ke Backend.

## 📊 Tabel Payload (Data yang Dikirim)
Tabel ini memetakan format data yang disiapkan Frontend untuk dikirim ke Backend.

| Field (JSON Key) | Tipe Data | Deskripsi / Asal Data di UI | Wajib? |
| :--- | :--- | :--- | :---: |
| `peminatan` | `String` | Pilihan dari dropdown Peminatan (DS, AI, dll) | ✅ |
| `semester` | `String` | Input teks semester (misal: "7") | ✅ |
| `tahunAkademik` | `String` | Input teks tahun (misal: "2025/2026") | ✅ |
| `judul` | `String` | Textarea usulan judul (Maks 20 kata) | ✅ |
| `dosenId` | `String` | NIDN Dosen dari dropdown Usulan Pembimbing | ✅ |
| `sksDicapai` | `String` | Input SKS tercapai (Minimal 100) | ✅ |
| `sksNilaiD` | `String` | Input SKS dengan nilai D/E (Harus 0) | ✅ |
| `ipk` | `String` | Input IPK (Minimal 2.00) | ✅ |
| `batasStudi` | `String` | Dihitung otomatis dari Tahun Masuk + 6 | ✅ |

---

## 🚀 Step-by-Step Cara Frontend Bekerja (Cara Fetch)

### Step 1: Penyiapan Wadah (State)
Di dalam komponen `PengajuanDesktop.tsx`, kita menggunakan `useState` untuk menampung data JSON kosong sesuai tabel di atas.
```typescript
const [formData, setFormData] = useState({
    peminatan: "", semester: "", tahunAkademik: "", judul: "",
    dosenId: "", sksDicapai: "", sksNilaiD: "", ipk: "", batasStudi: ""
});
```

### Step 2: User Mengisi Form
Setiap kali user mengetik atau memilih dropdown, JSON `formData` langsung di-update.
```typescript
const handleInputChange = (e) => {
    let { name, value } = e.target;
    // Misalnya user ngetik "AI Skripsi" di field judul
    setFormData(prev => ({ ...prev, [name]: value })); 
};
```

### Step 3: Proses Fetch API (Pengiriman)
Saat user menekan tombol **Submit**, frontend memvalidasi SKS dan IPK. Jika aman, frontend akan mengeksekusi "Fetch" untuk mengirim Request Body tersebut ke Backend menggunakan library HTTP Client (Axios).
```typescript
// Fungsi ini ada di file api/pengajuan.ts
createPengajuan: async (data: PengajuanPayload) => {
    // Menembak endpoint '/pengajuan' dengan method POST
    // 'data' (formData) otomatis dibungkus menjadi Request Body
    const response = await client.post("/pengajuan", data);
    
    // Mengembalikan jawaban dari backend
    return response.data;
}
```

### Step 4: Menampilkan Notifikasi Hasil (Response)
Frontend menunggu balasan dari Backend (Proses Asynchronous).
```typescript
try {
    // Memulai Fetch
    await pengajuanApi.createPengajuan(formData);
    
    // Jika backend balas Status 200/201 (Sukses)
    showToast("Pengajuan judul berhasil dikirim!", "success"); 
    navigate("/mahasiswa"); 
} catch (error) {
    // Jika backend balas Status 4xx/5xx (Gagal)
    showToast("Gagal mengirim pengajuan.", "destructive"); 
}
```
