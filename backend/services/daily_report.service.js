const CashLedgerModel = require('../models/cash_ledger.model');
const DailyReportModel = require('../models/daily_report.model');
const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');

const { getLocalPastDate, getLocalDate } = require('../helpers/datetime');

const {
  REPORT_NOT_FOUND,
  REPORT_ALREADY_CLOSED,
} = require('../helpers/error_codes');

const getAll = async () => {
  try {
    return await DailyReportModel.findAll();
  } catch (err) {
    throw new Error(err.message);
  }
};

const getToday = async () => {
  try {
    let report = await DailyReportModel.findToday();

    if (!report) {
      const today = getLocalDate();
      const yesterday = getLocalPastDate(1);

      const [revenue, hpp, cashLedger, yesterdayReport] = await Promise.all([
        TransactionModel.sumTodayRevenue(),
        TransactionItemModel.sumTodayHPP(),
        CashLedgerModel.sumByType(today),
        DailyReportModel.findByDate(yesterday),
      ]);

      const expenses = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense') {
          acc += cash.total || 0;
        }

        return acc;
      }, 0);

      const gross_profit = revenue - hpp;
      const opening_balance = yesterdayReport?.closing_balance || 0;
      const closing_balance = opening_balance + revenue - expenses;

      report = {
        date: today,
        total_revenue: revenue,
        total_expenses: expenses,
        gross_profit,
        opening_balance,
        closing_balance,
        status: 'open',
      };
    }

    return report;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getById = async (data) => {
  try {
    const { id } = data;

    const report = await DailyReportModel.findById(id);

    if (!report) throw new Error(REPORT_NOT_FOUND);

    return report;
  } catch (err) {
    throw new Error(err.message);
  }
};

const closeReport = async (data) => {
  try {
    const { user_id } = data;

    const report = await DailyReportModel.findToday();

    if (!report) {
      const today = getLocalDate();
      const yesterday = getLocalPastDate(1);

      const [revenue, hpp, cashLedger, yesterdayReport] = await Promise.all([
        TransactionModel.sumTodayRevenue(),
        TransactionItemModel.sumTodayHPP(),
        CashLedgerModel.sumByType(today),
        DailyReportModel.findByDate(yesterday),
      ]);

      const expenses = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense') {
          acc += cash.total || 0;
        }

        return acc;
      }, 0);

      const gross_profit = revenue - hpp;
      const opening_balance = yesterdayReport?.closing_balance || 0;
      const closing_balance = opening_balance + revenue - expenses;

      const reportId = await DailyReportModel.create({
        date: today,
        total_revenue: revenue,
        total_expenses: expenses,
        gross_profit,
        opening_balance,
        closing_balance,
        status: 'closed',
      });

      return reportId;
    }

    if (report.status === 'closed') throw new Error(REPORT_ALREADY_CLOSED);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getAll, getToday, getById, closeReport };
