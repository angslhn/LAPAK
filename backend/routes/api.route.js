const router = require('express').Router();

const { authenticate } = require('../middleware/authenticate');

const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const dashboardRoutes = require('./dashboard.route');
const categoryRoutes = require('./category.route');
const productRoutes = require('./product.route');
const stockRoutes = require('./stock.route');
const transactionRoutes = require('./transaction.route');
const purchaseRoutes = require('./purchase.route');
const supplierRoutes = require('./supplier.route');
const customerRoutes = require('./customer.route');
const cashRoutes = require('./cash.route');
const debtRoutes = require('./debt.route');
const reportRoutes = require('./report.route');
const dailyReportRoutes = require('./daily_report.route');

router.use('/auth', authRoutes);
router.use('/users', authenticate, userRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/categories', authenticate, categoryRoutes);
router.use('/products', authenticate, productRoutes);
router.use('/stock', authenticate, stockRoutes);
router.use('/transactions', authenticate, transactionRoutes);
router.use('/purchases', authenticate, purchaseRoutes);
router.use('/suppliers', authenticate, supplierRoutes);
router.use('/customers', authenticate, customerRoutes);
router.use('/cash', authenticate, cashRoutes);
router.use('/debts', authenticate, debtRoutes);
router.use('/reports', authenticate, reportRoutes);
router.use('/daily-reports', authenticate, dailyReportRoutes);

module.exports = router;
