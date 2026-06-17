const DebtInput = require('./inputs/debt.input');

const create = (data) => {
  const { supplier_id, date, due_date, receipt_number, total, note } = data;

  const checkSupplierId = DebtInput.supplierId(supplier_id);
  if (checkSupplierId) throw new Error(checkSupplierId);

  const checkDate = DebtInput.date(date);
  if (checkDate) throw new Error(checkDate);

  const checkDueDate = DebtInput.dueDate(due_date);
  if (checkDueDate) throw new Error(checkDueDate);

  const checkReceipt = DebtInput.receiptNumber(receipt_number);
  if (checkReceipt) throw new Error(checkReceipt);

  const checkTotal = DebtInput.amount(total);
  if (checkTotal) throw new Error(checkTotal);

  const checkNote = DebtInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

const update = (data) => {
  const { supplier_id, due_date, note } = data;

  const checkSupplierId = DebtInput.supplierId(supplier_id);
  if (checkSupplierId) throw new Error(checkSupplierId);

  const checkDueDate = DebtInput.dueDate(due_date);
  if (checkDueDate) throw new Error(checkDueDate);

  const checkNote = DebtInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

module.exports = { create, update };
