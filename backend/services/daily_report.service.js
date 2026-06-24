const { getPool } = require('../lib/mysql');

const CashLedgerModel = require('../models/cash_ledger.model');
const DailyReportModel = require('../models/daily_report.model');
const TransactionModel = require('../models/transaction.model');
const TransactionItemModel = require('../models/transaction_item.model');

const {
  getLocalPastDate,
  getLocalDate,
  getPastDateFromDate,
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

    if (report) {
      const today = getLocalDate();
      const cashLedger = await CashLedgerModel.findByDate(today);

      const expense = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense' && cash.category !== 'withdrawal') {
          acc += cash.amount || 0;
        }
        return acc;
      }, 0);

      const withdrawal = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense' && cash.category === 'withdrawal') {
          acc += cash.amount || 0;
        }
        return acc;
      }, 0);

      const revenue = report.total_revenue;
      const opening_balance = report.opening_balance;
      const net_profit = revenue - expense;
      const closing_balance = opening_balance + revenue - expense - withdrawal;

      if (
        report.total_expense !== expense ||
        report.closing_balance !== closing_balance
      ) {
        await DailyReportModel.update(report.id, {
          total_expense: expense,
          net_profit: net_profit,
          closing_balance: closing_balance,
        });

        report = await DailyReportModel.findToday();
      }

      return report;
    }

    const today = getLocalDate();
    const yesterday = getPastDateFromDate(today, 1);

    const [revenue, hpp, transaction_count, cashLedger, yesterdayReport] =
      await Promise.all([
        TransactionModel.sumTodayRevenue(),
        TransactionItemModel.sumTodayHPP(),
        TransactionModel.countToday(),
        CashLedgerModel.findByDate(today),
        DailyReportModel.findByDate(yesterday),
      ]);

    const expense = cashLedger.reduce((acc, cash) => {
      if (cash.type === 'expense' && cash.category !== 'withdrawal') {
        acc += cash.amount || 0;
      }
      return acc;
    }, 0);

    const withdrawal = cashLedger.reduce((acc, cash) => {
      if (cash.type === 'expense' && cash.category === 'withdrawal') {
        acc += cash.amount || 0;
      }
      return acc;
    }, 0);

    const net_profit = revenue - expense;
    const opening_balance = yesterdayReport?.closing_balance || 0;
    const closing_balance = opening_balance + revenue - expense - withdrawal;

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

    const sortedMissingDates = [...pending.missingDates];

    for (const missingDate of sortedMissingDates) {
      const existingReport = await DailyReportModel.findByDate(missingDate);

      if (existingReport) continue;

      const [cashTx] = await pool.execute(
        'SELECT COUNT(*) as total FROM cash_ledger WHERE DATE(date) = ?',
        [missingDate]
      );

      const transactionCount = await TransactionModel.countByDate(missingDate);

      if (
        Number(cashTx[0]?.total || 0) === 0 &&
        Number(transactionCount) === 0
      ) {
        let prevReport = null;
        let checkDate = new Date(missingDate);
        checkDate.setDate(checkDate.getDate() - 1);

        while (!prevReport) {
          const dateStr = checkDate.toISOString().split('T')[0];
          prevReport = await DailyReportModel.findByDate(dateStr);
          if (prevReport) break;
          checkDate.setDate(checkDate.getDate() - 1);
          if (checkDate < new Date('2026-01-01')) break;
        }

        const lastBalance = prevReport?.closing_balance || 0;

        await DailyReportModel.create({
          date: missingDate,
          total_revenue: 0,
          total_expense: 0,
          transaction_count: 0,
          net_profit: 0,
          opening_balance: lastBalance,
          closing_balance: lastBalance,
          status: 'closed',
        });
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

    const yesterday = getPastDateFromDate(getLocalDate(), 1);
    if (!allDates.includes(yesterday)) {
      allDates.push(yesterday);
    }

    const twoDaysAgo = getPastDateFromDate(getLocalDate(), 2);
    if (!allDates.includes(twoDaysAgo)) {
      allDates.push(twoDaysAgo);
    }

    allDates.sort();

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
      const prevDateStr = getPastDateFromDate(date, 1);

      const [revenue, hpp, transaction_count, cashLedger, previousReport] =
        await Promise.all([
          TransactionModel.sumRevenueByDate(date),
          TransactionItemModel.sumHPPByDate(date),
          TransactionModel.countByDate(date),
          CashLedgerModel.findByDate(date),
          DailyReportModel.findByDate(prevDateStr),
        ]);

      const expense = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense' && cash.category !== 'withdrawal') {
          acc += cash.amount || 0;
        }
        return acc;
      }, 0);

      const withdrawal = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense' && cash.category === 'withdrawal') {
          acc += cash.amount || 0;
        }
        return acc;
      }, 0);

      const net_profit = revenue - expense;
      const opening_balance = previousReport?.closing_balance || 0;
      const closing_balance = opening_balance + revenue - expense - withdrawal;

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
      const yesterday = getPastDateFromDate(today, 1);

      const [revenue, hpp, transaction_count, cashLedger, yesterdayReport] =
        await Promise.all([
          TransactionModel.sumTodayRevenue(),
          TransactionItemModel.sumTodayHPP(),
          TransactionModel.countToday(),
          CashLedgerModel.findByDate(today),
          DailyReportModel.findByDate(yesterday),
        ]);

      const expense = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense' && cash.category !== 'withdrawal') {
          acc += cash.amount || 0;
        }
        return acc;
      }, 0);

      const withdrawal = cashLedger.reduce((acc, cash) => {
        if (cash.type === 'expense' && cash.category === 'withdrawal') {
          acc += cash.amount || 0;
        }
        return acc;
      }, 0);

      const net_profit = revenue - expense;
      const opening_balance = yesterdayReport?.closing_balance || 0;
      const closing_balance = opening_balance + revenue - expense - withdrawal;

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
