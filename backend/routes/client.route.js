const router = require('express').Router();

const {
  requireAuth,
  redirectIfAuthenticated,
} = require('../middleware/authorization');

const { viewAuth, viewMain } = require('../helpers/view');

router.get('/masuk', redirectIfAuthenticated, viewAuth('masuk.html'));
router.get('/daftar', redirectIfAuthenticated, viewAuth('daftar.html'));
router.get(
  '/lupa-kata-sandi',
  redirectIfAuthenticated,
  viewAuth('lupa_kata_sandi.html')
);
router.get(
  '/ubah-kata-sandi',
  redirectIfAuthenticated,
  viewAuth('ubah_kata_sandi.html')
);

router.get('/', (req, res) => res.redirect('/beranda'));
router.get('/beranda', requireAuth, viewMain('beranda.html'));
router.get('/penjualan', requireAuth, viewMain('penjualan.html'));
router.get('/transaksi', requireAuth, viewMain('transaksi.html'));
router.get('/kategori', requireAuth, viewMain('kategori.html'));
router.get('/produk', requireAuth, viewMain('produk.html'));
router.get('/stok-barang', requireAuth, viewMain('stok_barang.html'));
router.get('/pembelian', requireAuth, viewMain('pembelian.html'));
router.get('/pelanggan', requireAuth, viewMain('pelanggan.html'));
router.get('/supplier', requireAuth, viewMain('supplier.html'));
router.get('/laporan', requireAuth, viewMain('laporan.html'));
router.get('/kas-dan-hutang', requireAuth, viewMain('kas_dan_hutang.html'));
router.get('/rekap-harian', requireAuth, viewMain('rekap_harian.html'));
router.get('/pengaturan', requireAuth, viewMain('pengaturan.html'));
router.get(
  '/pengaturan/edit-profil',
  requireAuth,
  viewMain('edit_profil.html')
);
router.get(
  '/pengaturan/ubah-kata-sandi',
  requireAuth,
  viewMain('ubah_kata_sandi.html')
);
router.get('/pengaturan/bank-qris', requireAuth, viewMain('bank_qris.html'));

module.exports = router;
