const ERROR_MESSAGES = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'Email atau password salah',
  AUTH_EMAIL_ALREADY_EXISTS: 'Email sudah terdaftar',
  AUTH_TOKEN_EXPIRED: 'Sesi login telah berakhir, silakan login ulang',
  AUTH_UNAUTHORIZED: 'Anda tidak memiliki akses',
  AUTH_INVALID_RESET_TOKEN:
    'Token reset password tidak valid atau sudah kadaluarsa',

  // General
  VALIDATION_ERROR: 'Data yang dikirim tidak valid',
  NOT_FOUND: 'Data tidak ditemukan',
  INTERNAL_SERVER_ERROR: 'Terjadi kesalahan pada server',
  NO_IMAGE_PROVIDED: 'Gambar tidak ditemukan',

  // User
  USER_NOT_FOUND: 'Pengguna tidak ditemukan',

  // Product
  PRODUCT_SKU_ALREADY_EXISTS: 'Kode SKU sudah digunakan',
  PRODUCT_NOT_FOUND: 'Produk tidak ditemukan',
  PRODUCT_INSUFFICIENT_STOCK: 'Stok produk tidak mencukupi',
  PRODUCT_UPDATE_FAILED: 'Gagal memperbarui produk',
  PRODUCT_DELETE_FAILED: 'Gagal menghapus produk',

  // Category
  CATEGORY_ALREADY_EXISTS: 'Kategori sudah ada',
  CATEGORY_NOT_FOUND: 'Kategori tidak ditemukan',
  CATEGORY_UPDATE_FAILED: 'Gagal memperbarui kategori',

  // Supplier
  SUPPLIER_NOT_FOUND: 'Supplier tidak ditemukan',

  // Customer
  CUSTOMER_NOT_FOUND: 'Pelanggan tidak ditemukan',

  // Transaction
  TRANSACTION_NOT_FOUND: 'Transaksi tidak ditemukan',
  TRANSACTION_ALREADY_CANCELLED: 'Transaksi sudah dibatalkan sebelumnya',

  // Purchase
  PURCHASE_NOT_FOUND: 'Pembelian tidak ditemukan',
  PURCHASE_ALREADY_PAID: 'Pembelian sudah lunas',

  // Debt
  DEBT_ALREADY_PAID: 'Hutang/piutang sudah lunas',

  // Daily Report
  REPORT_NOT_FOUND: 'Laporan harian tidak ditemukan',
  REPORT_ALREADY_CLOSED: 'Laporan harian sudah ditutup',
};

module.exports = ERROR_MESSAGES;
