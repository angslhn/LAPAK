const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');
const ProductModel = require('../models/product.model');

const getSummary = async () => {
  try {
    const hpp = await TransactionItemModel.sumTodayHPP();
    const revenue = await TransactionModel.sumTodayRevenue();

    const transaction_count = await TransactionModel.countToday();

    const gross_profit = revenue - hpp;

    const low_stock_products = await ProductModel.findLowStock();

    return { revenue, transaction_count, gross_profit, low_stock_products };
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getSummary };
