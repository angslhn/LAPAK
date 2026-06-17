const CashInput = require('./inputs/cash.input');

const create = (data) => {
  const { date, amount, note } = data;

  const checkDate = CashInput.date(date);
  if (checkDate) throw new Error(checkDate);

  const checkAmount = CashInput.amount(amount);
  if (checkAmount) throw new Error(checkAmount);

  const checkNote = CashInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

const update = (data) => {
  const { amount, category, date, note } = data;

  const checkAmount = CashInput.amount(amount);
  if (checkAmount) throw new Error(checkAmount);

  const checkCategory = CashInput.category(category);
  if (checkCategory) throw new Error(checkCategory);

  const checkDate = CashInput.date(date);
  if (checkDate) throw new Error(checkDate);

  const checkNote = CashInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

module.exports = { create, update };
