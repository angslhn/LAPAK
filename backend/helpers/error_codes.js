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
  INVALID_PASSWORD: 'INVALID_PASSWORD', // password lama salah

  // Product
  PRODUCT_SKU_ALREADY_EXISTS: 'PRODUCT_SKU_ALREADY_EXISTS', // kode sku telah tersedia
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND', // produk tidak ditemukan
  PRODUCT_INSUFFICIENT_STOCK: 'PRODUCT_INSUFFICIENT_STOCK', // stok tidak cukup
  PRODUCT_UPDATE_FAILED: 'PRODUCT_UPDATE_FAILED', // gagal update produk
  PRODUCT_DELETE_FAILED: 'PRODUCT_DELETE_FAILED', // gagal hapus produk

  // Category
  CATEGORY_ALREADY_EXISTS: 'CATEGORY_ALREADY_EXISTS', // kategori telah tersedia
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND', // kategori tidak ditemukan
  CATEGORY_UPDATE_FAILED: 'CATEGORY_UPDATE_FAILED', // gagal update kategori

  // Supplier
  SUPPLIER_NOT_FOUND: 'SUPPLIER_NOT_FOUND', // supplier tidak ditemukan

  // Customer
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND', // pelanggan tidak ditemukan

  // Transaction
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND', // transaksi tidak ditemukan
  TRANSACTION_ALREADY_CANCELLED: 'TRANSACTION_ALREADY_CANCELLED', // transaksi sudah dibatalkan

  // Purchase
  PURCHASE_NOT_FOUND: 'PURCHASE_NOT_FOUND', // pembelian tidak ditemukan
  PURCHASE_ALREADY_PAID: 'PURCHASE_ALREADY_PAID', // nota sudah lunas

  // Debt
  DEBT_ALREADY_PAID: 'DEBT_ALREADY_PAID', // hutang/piutang sudah lunas

  // Daily Report
  REPORT_NOT_FOUND: 'REPORT_NOT_FOUND', // rekap tidak ditemukan
  REPORT_ALREADY_CLOSED: 'REPORT_ALREADY_CLOSED', // rekap sudah ditutup
};

module.exports = ERROR_CODES;
