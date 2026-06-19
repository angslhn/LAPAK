const { getPool } = require('../lib/mysql');

const CashLedgerModel = require('../models/cash_ledger.model');
const DailyReportModel = require('../models/daily_report.model');
const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');

const {
  getLocalPastDate,
  getLocalDate,
  getLocalDateTime,
} = require('../helpers/datetime');

const {
  REPORT_NOT_FOUND,
  REPORT_NO_PENDING,
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
  const pool = getPool();

  try {
    const pending = await DailyReportModel.getPendingClosures();

    const filteredMissingDates = [];

    for (const missingDate of pending.missingDates) {
      const existingReport = await DailyReportModel.findByDate(missingDate);

      if (existingReport && existingReport.status === 'closed') {
        continue;
      }

      if (!existingReport || existingReport.status === 'open') {
        const [transactions] = await pool.execute(
          'SELECT COUNT(*) as total FROM cash_ledger WHERE DATE(date) = ?',
          [missingDate]
        );

        if (Number(transactions[0]?.total || 0) === 0) {
          const prevReport = await DailyReportModel.findByDate(
            getLocalPastDate(1, missingDate)
          );

          await DailyReportModel.create({
            date: missingDate,
            total_revenue: 0,
            total_expense: 0,
            transaction_count: 0,
            net_profit: 0,
            opening_balance: prevReport?.closing_balance || 0,
            closing_balance: prevReport?.closing_balance || 0,
            status: 'closed',
          });
        } else {
          filteredMissingDates.push(missingDate);
        }
      }
    }

    const updatedPending = await DailyReportModel.getPendingClosures();

    const finalMissingDates = [];

    for (const date of updatedPending.missingDates) {
      const report = await DailyReportModel.findByDate(date);
      if (!report || report.status === 'open') {
        finalMissingDates.push(date);
      }
    }

    let earliestDate = null;
    if (updatedPending.openReports.length > 0) {
      earliestDate = updatedPending.openReports[0].date;
    } else if (finalMissingDates.length > 0) {
      earliestDate = finalMissingDates[0];
    }

    return {
      hasPendingClosures:
        updatedPending.openReports.length > 0 || finalMissingDates.length > 0,
      openReports: updatedPending.openReports,
      missingDates: finalMissingDates,
      earliestDate: earliestDate,
      count: updatedPending.openReports.length + finalMissingDates.length,
    };
  } catch (err) {
    throw new Error(err);
  }
};

const closeAllPending = async (data) => {
  try {
    const { user_id: userId } = data;

    const results = [];

    const pending = await DailyReportModel.getPendingClosures();

    const allDates = [
      ...pending.openReports.map((r) => r.date),
      ...pending.missingDates,
    ].sort();

    const filteredDates = [];
    for (const date of allDates) {
      const existing = await DailyReportModel.findByDate(date);
      if (!existing || existing.status === 'open') {
        filteredDates.push(date);
      }
    }

    if (filteredDates.length === 0) {
      throw new Error(REPORT_NO_PENDING);
    }

    for (const date of filteredDates) {
      try {
        const result = await closeReportByDate(date, userId);
        results.push({ date, success: true, result });
      } catch (err) {
        results.push({ date, success: false, error: err.message });
      }
    }

    return results;
  } catch (err) {
    throw new Error(err);
  }
};

const closeReportByDate = async (date, userId) => {
  try {
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

      await DailyReportModel.closeReport(reportId, userId);

      return reportId;
    }

    if (report.status === 'closed') {
      throw new Error(REPORT_ALREADY_CLOSED);
    }

    await DailyReportModel.closeReport(report.id, userId);

    return report.id;
  } catch (err) {
    throw new Error(err);
  }
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
