const CashLedgerModel = require('../models/cash_ledger.model');
const DailyReportModel = require('../models/daily_report.model');

const calculateTrend = require('../helpers/calculate_trend');

const { getLocalPastDate, getLocalDate } = require('../helpers/datetime');
const { VALIDATION_ERROR, NOT_FOUND } = require('../helpers/error_codes');

const getAll = async () => {
  try {
    return await CashLedgerModel.findAll();
  } catch (err) {
    throw new Error(err.message);
  }
};

const getByDate = async (data) => {
  try {
    const { date } = data;
    const targetDate = date || getLocalDate();
    const yesterdayDate = getLocalPastDate(1);

    const yesterdayReport = await DailyReportModel.findByDate(yesterdayDate);
    const openingBalance = yesterdayReport?.closing_balance || 0;

    const [cashLedger, currentSummary, yesterdaySummary] = await Promise.all([
      CashLedgerModel.findByDate(targetDate),
      CashLedgerModel.getDailySummary(targetDate),
      CashLedgerModel.getDailySummaryByDate(yesterdayDate),
    ]);

    const closingBalance =
      openingBalance + currentSummary.income - currentSummary.expense;
    const incomeTrend = calculateTrend(
      currentSummary.income,
      yesterdaySummary.income
    );
    const expenseTrend = calculateTrend(
      currentSummary.expense,
      yesterdaySummary.expense
    );

    const formattedSummary = {
      opening_balance: openingBalance,
      income: currentSummary.income,
      expense: currentSummary.expense,
      closing_balance: closingBalance,
      income_trend_percentage: incomeTrend,
      expense_trend_percentage: expenseTrend,
    };

    return { summary: formattedSummary, mutations: cashLedger };
  } catch (err) {
    throw new Error(err.message);
  }
};

const createExpense = async (data) => {
  try {
    const { date, note, amount } = data;

    if (amount <= 0) throw new Error(VALIDATION_ERROR);

    const cashLedgerId = await CashLedgerModel.create({
      date,
      type: 'expense',
      category: 'operational',
      note,
      amount,
      reference_id: null,
      reference_type: 'manual',
    });

    return cashLedgerId;
  } catch (err) {
    throw new Error(err.message);
  }
};

const createIncome = async (data) => {
  try {
    const { date, note, amount } = data;

    if (amount <= 0) throw new Error(VALIDATION_ERROR);

    const cashLedgerId = await CashLedgerModel.create({
      date,
      type: 'income',
      category: 'operational',
      note,
      amount,
      reference_id: null,
      reference_type: 'manual',
    });

    return cashLedgerId;
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateCashTransaction = async (data) => {
  try {
    const { id, amount, category, date, note } = data;

    const existing = await CashLedgerModel.findById(id);
    if (!existing) throw new Error(NOT_FOUND);

    const affectedRows = await CashLedgerModel.updateById(id, {
      amount,
      category,
      date,
      note: note || null,
    });

    if (affectedRows === 0) throw new Error(NOT_FOUND);

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteCashTransaction = async (id) => {
  try {
    const existing = await CashLedgerModel.findById(id);
    if (!existing) throw new Error(NOT_FOUND);

    const affectedRows = await CashLedgerModel.deleteById(id);
    if (affectedRows === 0) throw new Error(NOT_FOUND);

    return affectedRows;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  getAll,
  getByDate,
  createExpense,
  createIncome,
  updateCashTransaction,
  deleteCashTransaction,
};
