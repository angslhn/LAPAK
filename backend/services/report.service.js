const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');

const {
  getLocalPastDate,
  getLocalDate,
  isDayName,
} = require('../helpers/datetime');

const { VALIDATION_ERROR } = require('../helpers/error_codes');

const PERIOD = ['week', 'month', 'custom'];

const getRevenue = async (data) => {
  try {
    const { period, from, to } = data;

    if (!PERIOD.includes(period)) throw new Error(VALIDATION_ERROR);

    let fromDate;
    let toDate;

    if (period === 'week') {
      fromDate = getLocalPastDate(6);
      toDate = getLocalDate();
    }

    if (period === 'month') {
      const now = new Date();

      fromDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });

      toDate = getLocalDate();
    }

    if (period === 'custom') {
      fromDate = from;
      toDate = to;
    }

    const revenue = await TransactionModel.sumRevenueByRange(fromDate, toDate);

    const hpp = await TransactionItemModel.sumHPPByRange(fromDate, toDate);

    const labels = revenue.map((rev) => {
      const date = rev.date;

      return {
        date,
        dayname: isDayName(date),
      };
    });

    const hppMap = {};

    hpp.forEach((h) => (hppMap[h.date] = h.total));

    const gross_profit = revenue.map((rev) => ({
      date: rev.date,
      value: rev.total - (hppMap[rev.date] || 0),
    }));

    return { labels, revenue, gross_profit };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getTopProducts = async (data) => {
  try {
    const { limit = 5, from, to } = data;

    if (from && to) {
      return await TransactionItemModel.findTopProductsByRange(from, to, limit);
    }

    return await TransactionItemModel.findTopProductsAllTime(limit);
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

module.exports = { getRevenue, getTopProducts, getByCategory };
