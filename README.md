# 🏪 LAPAK — Aplikasi POS Warung dan Toko Kelontong

LAPAK adalah aplikasi *Point of Sale* (POS) berbasis web yang dirancang khusus untuk operasional warung, toko kelontong, dan toko grosir kecil. Dibangun untuk menyederhanakan pencatatan penjualan harian, stok barang, dan keuangan toko — tanpa perlu keahlian akuntansi.

## ✨ Fitur Utama

* **🔐 Autentikasi** — Login/register aman dengan JWT, dan lupa kata sandi via email
* **🖼️ Upload Gambar** — Foto produk, avatar toko, dan QRIS via Cloudinary
* **🛒 Kasir (POS)** — Proses transaksi cepat dengan panel keranjang belanja real-time, mendukung pembayaran **tunai, QRIS, transfer bank, dan piutang**
* **🏦 Rekening & QRIS** — Kelola nomor rekening dan upload gambar QRIS untuk pembayaran customer
* **📦 Manajemen Produk & Stok** — Pemantauan stok dengan indikator visual (Aman / Menipis / Kritis) dan riwayat mutasi stok
* **🚚 Pembelian & Supplier** — Pencatatan restock dari supplier, stok naik otomatis setelah pembelian dicatat
* **👛 Kas & Hutang Piutang** — Pelacakan arus kas harian, piutang pelanggan, dan hutang dagang ke supplier dengan **cicilan/pembayaran parsial**
* **📊 Laporan & Analitik** — Grafik omzet mingguan, laba bersih, produk terlaris, dan ringkasan performa bisnis
* **📅 Rekap & Tutup Buku Harian** — Rekonsiliasi kas, penguncian data harian, dan **notifikasi laporan yang belum ditutup**
* **🎨 UI/UX Modern** — Tampilan responsif, toast notification, modal konfirmasi, pagination, dan input style yang konsisten

### 🔥 Highlight Teknis

| Fitur | Detail |
|-------|--------|
| **Pagination** | Semua tabel otomatis paginate setiap 10 data |
| **Bank & QRIS** | CRUD rekening + upload/hapus gambar QRIS |
| **Partial Payment** | Bayar hutang & piutang secara cicilan |
| **Banner Notifikasi** | Peringatan tutup buku di dashboard |
| **Toast & Modal** | Konfirmasi untuk semua aksi berbahaya (hapus, tutup buku, logout) |

## 🛠️ Teknologi

**Frontend:**
* HTML5, CSS3, Vanilla JavaScript
* Fetch API untuk komunikasi dengan backend

**Backend:**
* Node.js, Express.js, MySQL
* JWT untuk autentikasi
* Multer & Cloudinary untuk upload gambar
* Nodemailer untuk email reset password

## 📂 Struktur Direktori

```text
lapak/
├── backend/
│   ├── config/          # Konfigurasi environment & variabel global
│   ├── controllers/     # Handler request & response per fitur
│   ├── database/        # File SQL (schema & seed)
│   ├── helpers/         # Utility fungsi (response formatter, dll)
│   ├── lib/             # Inisialisasi koneksi MySQL dan lainnya
│   ├── middleware/      # Autentikasi token, validasi input, dan lainnya
│   ├── models/          # Query helper per tabel (findById, create, dll)
│   ├── routes/          # Definisi endpoint API (prefix /api)
│   ├── services/        # Business logic (penjualan, stok, kas, rekap, dll)
│   ├── .env.example     # Contoh konfigurasi environment variables
│   └── server.js        # Entry point — inisialisasi Express
├── frontend/
│   ├── assets/          # Ikon, gambar, dan file statis
│   ├── scripts/         # Vanilla JS per halaman (fetch & DOM)
│   ├── styles/          # CSS native per halaman & global
│   └── views/           # Halaman HTML (beranda, penjualan, dll)
├── .gitignore
└── README.md            # Dokumentasi proyek
```

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js (v18 atau lebih baru)
- MySQL (v8 atau lebih baru)
- npm atau yarn

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/angslhn/LAPAK.git
cd LAPAK

# 2. Masuk ke folder backend
cd backend

# 3. Install dependensi
npm install

# 4. Copy file environment
cp .env.example .env
# Edit file .env sesuai dengan konfigurasi database dan SMTP Anda

# 5. Import database
mysql -u root -p lapak_db < database/schema.sql
# (Opsional) mysql -u root -p lapak_db < database/seed.sql

# 6. Jalankan server development
npm run dev
```
