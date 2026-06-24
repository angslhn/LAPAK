const UserModel = require('../models/user.model');
const CashLedgerModel = require('../models/cash_ledger.model');
const ProductModel = require('../models/product.model');
const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');

const calculateTrend = require('../helpers/calculate_trend');
const {
  getLocalDate,
  getLocalPastDate,
  isDayName,
} = require('../helpers/datetime');

const getSummary = async (userId) => {
  const fromDate = getLocalPastDate(6);
  const yesterdayDate = getLocalPastDate(1);
  const todayDate = getLocalDate();

  try {
    const [cashLedgerToday, cashLedgerYesterday] = await Promise.all([
      CashLedgerModel.findByDate(todayDate),
      CashLedgerModel.findByDate(yesterdayDate),
    ]);

    const [
      hpp,
      revenue,
      transaction_count,
      products_sold,
      top_selling_products,
      weeklyRevenue,
      lowStock,
      yesterdayRevenue,
      yesterdayTxCount,
      yesterdayProductsSold,
      user,
    ] = await Promise.all([
      TransactionItemModel.sumTodayHPP(),
      TransactionModel.sumTodayRevenue(),
      TransactionModel.countToday(),
      TransactionItemModel.sumTodayQuantity(),
      TransactionItemModel.findTopProductsToday(5),
      TransactionModel.sumRevenueByRange(fromDate, todayDate),
      ProductModel.findLowStock(),
      TransactionModel.sumRevenueByDate(yesterdayDate),
      TransactionModel.countByDate(yesterdayDate),
      TransactionItemModel.sumQuantityByDate(yesterdayDate),
      UserModel.findById(userId),
    ]);

    const yesterdayExpenses = Number(
      cashLedgerYesterday.find(
        (cash) => cash.type === 'expense' && cash.category !== 'withdrawal'
      )?.amount || 0
    );
    const yesterdayNetProfit = yesterdayRevenue - yesterdayExpenses;

    const total_expenses = cashLedgerToday.reduce((acc, cash) => {
      if (cash.type === 'expense' && cash.category !== 'withdrawal') {
        acc += cash.amount || 0;
      }
      return acc;
    }, 0);

    const net_profit = revenue - total_expenses;

    const low_stock_products = lowStock.map(
      ({ id, name, selling_price, stock }) => ({
        id,
        name,
        price: selling_price,
        stock,
      })
    );

    const chart_weekly_revenue = [];

    for (let i = 6; i >= 0; i--) {
      const targetDate = getLocalPastDate(i);

      const foundData = weeklyRevenue.find((data) => {
        const dbDateStr = new Date(data.date).toLocaleDateString('sv-SE', {
          timeZone: 'Asia/Jakarta',
        });

        return dbDateStr === targetDate;
      });

      chart_weekly_revenue.push({
        day: isDayName(targetDate),
        total: foundData ? Number(foundData.total) : 0,
      });
    }

    return {
      name: user.name || null,
      summary_metrics: {
        revenue: {
          value: revenue,
          trend_percentage: calculateTrend(revenue, yesterdayRevenue),
        },
        transaction_count: {
          value: transaction_count,
          trend_percentage: calculateTrend(transaction_count, yesterdayTxCount),
        },
        net_profit: {
          value: net_profit,
          trend_percentage: calculateTrend(net_profit, yesterdayNetProfit),
        },
        products_sold: {
          value: products_sold,
          trend_percentage: calculateTrend(
            products_sold,
            yesterdayProductsSold
          ),
        },
      },
      daily_summary: {
        transaction_count,
        gross_revenue: revenue,
        total_expenses: Number(
          cashLedgerToday.find(
            (cash) => cash.type === 'expense' && cash.category !== 'withdrawal'
          )?.amount || 0
        ),
        net_profit,
      },
      chart_weekly_revenue,
      low_stock_products,
      top_selling_products,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getSummary };
