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

      const [revenue, hpp, transaction_count, cashLedger, yesterdayReport] =
        await Promise.all([
          TransactionModel.sumTodayRevenue(),
          TransactionItemModel.sumTodayHPP(),
          TransactionModel.countToday(),
          CashLedgerModel.sumByType(today),
          DailyReportModel.findByDate(yesterday),
        ]);

      const expense = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense') {
          acc += cash.total || 0;
        }

        return acc;
      }, 0);

      const net_profit = revenue - hpp - expense;
      const opening_balance = yesterdayReport?.closing_balance || 0;
      const closing_balance = opening_balance + revenue - expense;

      report = {
        date: today,
        total_revenue: revenue,
        total_expense: expense,
        transaction_count,
        net_profit,
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

const getClosureStatus = async () => {
  const pending = await DailyReportModel.getPendingClosures();

  let earliestDate = null;

  if (pending.openReports.length > 0) {
    earliestDate = pending.openReports[0].date;
  } else if (pending.missingDates.length > 0) {
    earliestDate = pending.missingDates[0];
  }

  return {
    hasPendingClosures:
      pending.openReports.length > 0 || pending.missingDates.length > 0,
    openReports: pending.openReports,
    missingDates: pending.missingDates,
    earliestDate: earliestDate,
    count: pending.openReports.length + pending.missingDates.length,
  };
};

const closeAllPending = async (data) => {
  const { user_id } = data;
  const results = [];

  const pending = await DailyReportModel.getPendingClosures();

  const allDates = [
    ...pending.openReports.map((r) => r.date),
    ...pending.missingDates,
  ].sort();

  if (allDates.length === 0) {
    throw new Error('Tidak ada laporan yang perlu ditutup');
  }

  for (const date of allDates) {
    try {
      const result = await closeReportByDate(date, user_id);
      results.push({ date, success: true, result });
    } catch (err) {
      results.push({ date, success: false, error: err.message });
    }
  }

  return results;
};

const closeReportByDate = async (date, user_id) => {
  let report = await DailyReportModel.findByDate(date);

  if (!report) {
    const [revenue, hpp, transaction_count, cashLedger, previousReport] =
      await Promise.all([
        TransactionModel.sumRevenueByDate(date),
        TransactionItemModel.sumHPPByDate(date),
        TransactionModel.countByDate(date),
        CashLedgerModel.sumByType(date),
        DailyReportModel.findByDate(getLocalPastDate(1, date)),
      ]);

    const expense = cashLedger.reduce((acc, cash) => {
      if (cash.type === 'expense') acc += cash.total || 0;
      return acc;
    }, 0);

    const net_profit = revenue - hpp - expense;
    const opening_balance = previousReport?.closing_balance || 0;
    const closing_balance = opening_balance + revenue - expense;

    const reportId = await DailyReportModel.create({
      date: date,
      total_revenue: revenue,
      total_expense: expense,
      transaction_count,
      net_profit,
      opening_balance,
      closing_balance,
      status: 'closed',
    });

    await DailyReportModel.closeReport(reportId, user_id);

    return reportId;
  }

  if (report.status === 'closed') {
    throw new Error(REPORT_ALREADY_CLOSED);
  }

  await DailyReportModel.closeReport(report.id, user_id);

  return report.id;
};

const closeReport = async (data) => {
  try {
    const { user_id } = data;

    const report = await DailyReportModel.findToday();

    if (!report) {
      const today = getLocalDate();
      const yesterday = getLocalPastDate(1);

      const [revenue, hpp, transaction_count, cashLedger, yesterdayReport] =
        await Promise.all([
          TransactionModel.sumTodayRevenue(),
          TransactionItemModel.sumTodayHPP(),
          TransactionModel.countToday(),
          CashLedgerModel.sumByType(today),
          DailyReportModel.findByDate(yesterday),
        ]);

      const expense = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense') acc += cash.total || 0;
        return acc;
      }, 0);

      const net_profit = revenue - hpp - expense;
      const opening_balance = yesterdayReport?.closing_balance || 0;
      const closing_balance = opening_balance + revenue - expense;

      const reportId = await DailyReportModel.create({
        date: today,
        total_revenue: revenue,
        total_expense: expense,
        transaction_count,
        net_profit,
        opening_balance,
        closing_balance,
        status: 'closed',
      });

      await DailyReportModel.closeReport(reportId, user_id);

      return reportId;
    }

    if (report.status === 'closed') throw new Error(REPORT_ALREADY_CLOSED);

    await DailyReportModel.closeReport(report.id, user_id);

    return report.id;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getAll,
  getToday,
  getById,
  getClosureStatus,
  closeAllPending,
  closeReportByDate,
  closeReport,
};
