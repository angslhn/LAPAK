const CashLedgerModel = require('../models/cash_ledger.model');
const ProductModel = require('../models/product.model');
const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');

const { calculateTrend } = require('../helpers/calculate_trend');
const {
  getLocalDate,
  getLocalPastDate,
  isDayName,
} = require('../helpers/datetime');

const getSummary = async () => {
  const fromDate = getLocalPastDate(6);
  const yesterdayDate = getLocalPastDate(1);
  const todayDate = getLocalDate();

  try {
    const [
      hpp,
      revenue,
      transaction_count,
      products_sold,
      top_selling_products,
      weeklyRevenue,
      cashLedgerToday,
      lowStock,
      yesterdayRevenue,
      yesterdayTxCount,
      yesterdayProductsSold,
      yesterdayCashLedger,
    ] = await Promise.all([
      TransactionItemModel.sumTodayHPP(),
      TransactionModel.sumTodayRevenue(),
      TransactionModel.countToday(),
      TransactionItemModel.sumTodayQuantity(),
      TransactionItemModel.findTopProductsToday(5),
      TransactionModel.sumRevenueByRange(fromDate, todayDate),
      CashLedgerModel.sumByType(todayDate),
      ProductModel.findLowStock(),
      TransactionModel.sumRevenueByDate(yesterdayDate),
      TransactionModel.countByDate(yesterdayDate),
      TransactionItemModel.sumQuantityByDate(yesterdayDate),
      CashLedgerModel.sumByType(yesterdayDate),
    ]);

    const yesterdayExpenses = Number(
      yesterdayCashLedger.find((cash) => cash.type === 'expense')?.total || 0
    );
    const yesterdayNetProfit = yesterdayRevenue - yesterdayExpenses;

    const total_expenses = Number(
      cashLedgerToday.find((cash) => cash.type === 'expense')?.total || 0
    );
    const net_profit = revenue - total_expenses;

    const low_stock_products = lowStock.map(
      ({ id, name, selling_price, stock }) => {
        return {
          id,
          name,
          price: selling_price,
          stock,
        };
      }
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
        total_expenses,
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
