# 🏪 LAPAK — Aplikasi POS Warung dan Toko Kelontong

LAPAK adalah aplikasi *Point of Sale* (POS) berbasis web yang dirancang khusus untuk operasional warung, toko kelontong, dan toko grosir kecil. Dibangun untuk menyederhanakan pencatatan penjualan harian, stok barang, dan keuangan toko — tanpa perlu keahlian akuntansi.

## ✨ Fitur Utama
* **🔐 Autentikasi** — Login/register aman dengan JWT atau OAuth, dan lupa password via email
* **🖼️ Upload Gambar** — Foto produk dan avatar toko via Cloudinary
* **👥 Multi-user** — Role Owner & Kasir dengan hak akses berbeda
* **🛒 Kasir (POS)** — Proses transaksi cepat dengan panel keranjang belanja real-time, mendukung pembayaran tunai, QRIS, transfer, dan hutang.
* **📦 Manajemen Produk & Stok** — Pemantauan stok dengan indikator visual (Aman / Hampir Habis / Kritis) dan notifikasi otomatis.
* **🚚 Pembelian & Supplier** — Pencatatan restock dari supplier, stok naik otomatis setelah pembelian dicatat.
* **👛 Kas & Hutang Piutang** — Pelacakan arus kas harian, piutang pelanggan, dan hutang dagang ke supplier.
* **📊 Laporan & Analitik** — Grafik omzet, laba kotor, produk terlaris, dan breakdown per kategori.
* **📅 Rekap & Tutup Buku Harian** — Rekonsiliasi kas dan penguncian data harian untuk integritas pencatatan.

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
