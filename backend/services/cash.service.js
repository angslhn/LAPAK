const CashLedgerModel = require('../models/cash_ledger.model');

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

    const cashLedger = await CashLedgerModel.findByDate(date);

    const summary = await CashLedgerModel.sumByType(date);

    const formattedSummary = {
      income: summary.find((s) => s.type === 'income')?.total || 0,
      expense: summary.find((s) => s.type === 'expense')?.total || 0,
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
