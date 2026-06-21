const CashLedgerModel = require('../models/cash_ledger.model');
const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');

const {
  getLocalPastDate,
  getLocalDate,
  isDayName,
} = require('../helpers/datetime');

const { VALIDATION_ERROR } = require('../helpers/error_codes');

const getRevenue = async (data) => {
  try {
    const { period, from, to } = data;

    let fromDate;
    let toDate;

    if (period === 'week') {
      fromDate = getLocalPastDate(6);
      toDate = getLocalDate();
    } else if (period === 'month') {
      const now = new Date();

      fromDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
      toDate = getLocalDate();
    } else if (period === 'year') {
      const now = new Date();

      fromDate = new Date(now.getFullYear(), 0, 1).toLocaleDateString('sv-SE', {
        timeZone: 'Asia/Jakarta',
      });
      toDate = getLocalDate();
    } else if (period === 'custom') {
      fromDate = from;
      toDate = to;
    } else {
      fromDate = getLocalPastDate(6);
      toDate = getLocalDate();
    }

    if (!fromDate || !toDate) {
      fromDate = getLocalPastDate(6);
      toDate = getLocalDate();
    }

    const formattedFrom = fromDate.split('T')[0];
    const formattedTo = toDate.split('T')[0];

    const [revenue, hpp, expenses] = await Promise.all([
      TransactionModel.sumRevenueByRange(fromDate, toDate),
      TransactionItemModel.sumHPPByRange(fromDate, toDate),
      CashLedgerModel.sumExpensesByRange(fromDate, toDate),
    ]);

    const dateRange = [];

    let currentDate = new Date(fromDate);
    const endDate = new Date(toDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toLocaleDateString('sv-SE', {
        timeZone: 'Asia/Jakarta',
      });

      dateRange.push(dateStr);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const labels = dateRange.map((date) => ({
      date,
      dayname: isDayName(date),
    }));

    const revenueMap = {};
    revenue.forEach((r) => {
      const dateStr = new Date(r.date).toISOString().split('T')[0];
      revenueMap[dateStr] = r.total;
    });

    const hppMap = {};
    hpp.forEach((h) => {
      const dateStr = new Date(h.date).toISOString().split('T')[0];
      hppMap[dateStr] = h.total;
    });

    const expensesMap = {};
    expenses.forEach((e) => {
      const dateStr = new Date(e.date).toISOString().split('T')[0];
      expensesMap[dateStr] = e.total;
    });

    const revenueFormatted = dateRange.map((date) => ({
      date,
      total: revenueMap[date] || 0,
    }));

    const grossProfitFormatted = dateRange.map((date) => ({
      date,
      value: (revenueMap[date] || 0) - (hppMap[date] || 0),
    }));

    const netProfitFormatted = dateRange.map((date) => ({
      date,
      value:
        (revenueMap[date] || 0) -
        (hppMap[date] || 0) -
        (expensesMap[date] || 0),
    }));

    return {
      labels,
      revenue: revenueFormatted,
      gross_profit: grossProfitFormatted,
      net_profit: netProfitFormatted,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getTopProducts = async (data) => {
  try {
    const { limit = 5, period, from, to } = data;

    let fromDate, toDate;

    if (period === 'week') {
      fromDate = getLocalPastDate(6);
      toDate = getLocalDate();
    } else if (period === 'month') {
      const now = new Date();

      fromDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toLocaleDateString('sv-SE', {
        timeZone: 'Asia/Jakarta',
      });

      toDate = getLocalDate();
    } else if (period === 'year') {
      const now = new Date();

      fromDate = new Date(now.getFullYear(), 0, 1).toLocaleDateString('sv-SE', {
        timeZone: 'Asia/Jakarta',
      });

      toDate = getLocalDate();
    } else if (period === 'custom') {
      fromDate = from;
      toDate = to;
    } else {
      return await TransactionItemModel.findTopProductsAllTime(limit);
    }

    if (!fromDate || !toDate) {
      return await TransactionItemModel.findTopProductsAllTime(limit);
    }

    return await TransactionItemModel.findTopProductsByDateRange(
      fromDate,
      toDate,
      limit
    );
  } catch (err) {
    throw new Error(err.message);
  }
};

const getByCategory = async () => {
  try {
    return await TransactionItemModel.findRevenueByCategory();
  } catch (err) {
    throw new Error(err.message);
  }
};

const getCategoryQuantity = async () => {
  try {
    return await TransactionItemModel.sumQuantityByCategory();
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getRevenue,
  getTopProducts,
  getByCategory,
  getCategoryQuantity,
};
