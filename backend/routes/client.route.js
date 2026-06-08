const router = require('express').Router();

const {
  requireAuth,
  redirectIfAuthenticated,
} = require('../middleware/authorization');

const { view } = require('../helpers/view');

router.get('/masuk', redirectIfAuthenticated, view('masuk.html'));
router.get('/daftar', redirectIfAuthenticated, view('daftar.html'));
router.get(
  '/lupa-password',
  redirectIfAuthenticated,
  view('lupa_password.html')
);
router.get(
  '/reset-password',
  redirectIfAuthenticated,
  view('reset_password.html')
);

router.get('/', (req, res) => res.redirect('/beranda'));
router.get('/beranda', requireAuth, view('beranda.html'));
router.get('/penjualan', requireAuth, view('penjualan.html'));
router.get('/transaksi', requireAuth, view('transaksi.html'));
router.get('/kategori', requireAuth, view('kategori.html'));
router.get('/produk', requireAuth, view('produk.html'));
router.get('/stok', requireAuth, view('stok.html'));
router.get('/pembelian', requireAuth, view('pembelian.html'));
router.get('/supplier', requireAuth, view('supplier.html'));
router.get('/laporan', requireAuth, view('laporan.html'));
router.get('/kas-hutang', requireAuth, view('kas_hutang.html'));
router.get('/rekap-harian', requireAuth, view('rekap_harian.html'));
router.get('/pengaturan', requireAuth, view('pengaturan.html'));

module.exports = router;
