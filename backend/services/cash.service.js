const CashLedgerModel = require('../models/cash_ledger.model');
const DailyReportModel = require('../models/daily_report.model');

const calculateTrend = require('../helpers/calculate_trend');

const { getLocalPastDate, getLocalDate } = require('../helpers/datetime');
const { VALIDATION_ERROR } = require('../helpers/error_codes');

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

    const [cashLedger, currentSummary, yesterdaySummary, openingBalance] =
      await Promise.all([
        CashLedgerModel.findByDate(targetDate),
        CashLedgerModel.getDailySummary(targetDate),
        CashLedgerModel.getDailySummaryByDate(yesterdayDate),
        CashLedgerModel.getClosingBalanceByDate(targetDate),
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

module.exports = { getAll, getByDate, createExpense, createIncome };
