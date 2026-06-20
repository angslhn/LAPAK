const ERROR_CODES = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS', // email/password salah
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS', // email telah tersedia
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED', // JWT expired
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED', // tidak ada token / token invalid
  AUTH_INVALID_RESET_TOKEN: 'AUTH_INVALID_RESET_TOKEN', // reset token tidak valid

  // General
  VALIDATION_ERROR: 'VALIDATION_ERROR', // input tidak valid
  NOT_FOUND: 'NOT_FOUND', // resource generic tidak ditemukan
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR', // error tidak terduga
  NO_IMAGE_PROVIDED: 'NO_IMAGE_PROVIDED', // gambar tidak ditemukan

  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND', // user tidak ditemukan
  USER_INVALID_PASSWORD: 'USER_INVALID_PASSWORD', // password lama salah
  USER_UPDATE_FAILED: 'USER_UPDATE_FAILED', // gagal memperbarui pengguna
  USER_AVATAR_UPDATE_FAILED: 'USER_AVATAR_UPDATE_FAILED', // gagal memperbarui avatar pengguna

  // Bank Account
  BANK_ACCOUNT_NOT_FOUND: 'BANK_ACCOUNT_NOT_FOUND', // akun bank tidak ditemukan
  BANK_ACCOUNT_UPDATE_FAILED: 'BANK_ACCOUNT_UPDATE_FAILED', // gagal memperbarui data akun bank
  BANK_ACCOUNT_DELETE_FAILED: 'BANK_ACCOUNT_DELETE_FAILED', // gagal menghapus data akun bank
  QRIS_NOT_FOUND: 'QRIS_NOT_FOUND', // QRIS tidak ditemukan

  // Product
  PRODUCT_SKU_ALREADY_EXISTS: 'PRODUCT_SKU_ALREADY_EXISTS', // kode sku telah tersedia
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND', // produk tidak ditemukan
  PRODUCT_INSUFFICIENT_STOCK: 'PRODUCT_INSUFFICIENT_STOCK', // stok tidak cukup
  PRODUCT_IMAGE_UPDATE_FAILED: 'PRODUCT_IMAGE_UPDATE_FAILED', // gagal memperbarui gambar produk
  PRODUCT_UPDATE_FAILED: 'PRODUCT_UPDATE_FAILED', // gagal memperbarui produk
  PRODUCT_DELETE_FAILED: 'PRODUCT_DELETE_FAILED', // gagal hapus produk

  // Category
  CATEGORY_ALREADY_EXISTS: 'CATEGORY_ALREADY_EXISTS', // kategori telah tersedia
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND', // kategori tidak ditemukan
  CATEGORY_UPDATE_FAILED: 'CATEGORY_UPDATE_FAILED', // gagal memperbarui kategori

  // Supplier
  SUPPLIER_NOT_FOUND: 'SUPPLIER_NOT_FOUND', // supplier tidak ditemukan
  SUPPLIER_UPDATE_FAILED: 'SUPPLIER_UPDATE_FAILED', // gagal memperbarui supplier
  SUPPLIER_DELETE_FAILED: 'SUPPLIER_DELETE_FAILED', // gagal menghapus supplier

  // Customer
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND', // pelanggan tidak ditemukan
  CUSTOMER_UPDATE_FAILED: 'CUSTOMER_UPDATE_FAILED', // gagal memperbarui pelanggan

  // Transaction
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND', // transaksi tidak ditemukan
  TRANSACTION_ALREADY_CANCELLED: 'TRANSACTION_ALREADY_CANCELLED', // transaksi sudah dibatalkan

  // Purchase
  PURCHASE_NOT_FOUND: 'PURCHASE_NOT_FOUND', // pembelian tidak ditemukan
  PURCHASE_ALREADY_PAID: 'PURCHASE_ALREADY_PAID', // nota sudah lunas
  PURCHASE_MARK_PAID_FAILED: 'PURCHASE_MARK_PAID_FAILED', // tanda lunas gagal

  // Debt
  DEBT_NOT_FULLY_PAID: 'DEBT_NOT_FULLY_PAID', // hutang belum sepenuhnya terlunasi
  DEBT_CUSTOMER_ALREADY_PAID: 'DEBT_CUSTOMER_ALREADY_PAID', // piutang dari pelanggan sudah lunas
  DEBT_CUSTOMER_ALREADY_CANCELLED: 'DEBT_CUSTOMER_ALREADY_CANCELLED', // piutang dari pelanggan sudah dibatalkan
  DEBT_SUPPLIER_ALREADY_PAID: 'DEBT_SUPPLIER_ALREADY_PAID', // hutang ke supplier sudah lunas

  // Daily Report
  REPORT_NOT_FOUND: 'REPORT_NOT_FOUND', // rekap tidak ditemukan
  REPORT_NO_PENDING: 'REPORT_NO_PENDING', // tidak ada report yang perlu ditutup
  REPORT_ALREADY_CLOSED: 'REPORT_ALREADY_CLOSED', // rekap sudah ditutup
};

module.exports = ERROR_CODES;
