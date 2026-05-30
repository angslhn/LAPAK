# 🏪 LAPAK — Laporan Penjualan dan Kas

LAPAK adalah aplikasi *Point of Sale* (POS) berbasis web yang dirancang khusus untuk operasional warung, toko kelontong, dan toko grosir kecil. Dibangun untuk menyederhanakan pencatatan penjualan harian, stok barang, dan keuangan toko — tanpa perlu keahlian akuntansi.

## ✨ Fitur Utama

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

```bash
# 1. Clone repo
git clone https://github.com/angslhn/LAPAK.git
cd LAPAK

# 2. Setup backend
cd backend
npm install

# 3. Jalankan
npm run dev
# Buka http://localhost:3000
```
