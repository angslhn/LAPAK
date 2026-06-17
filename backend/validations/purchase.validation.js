const PurchaseInput = require('./inputs/purchase.input');

const create = (data) => {
  const {
    supplier_id,
    receipt_number,
    date,
    due_date,
    items,
    note,
    payment_status,
  } = data;

  const checkSupplierId = PurchaseInput.supplierId(supplier_id);
  if (checkSupplierId) throw new Error(checkSupplierId);

  const checkDate = PurchaseInput.date(date);
  if (checkDate) throw new Error(checkDate);

  const checkDueDate = PurchaseInput.dueDate(due_date);
  if (checkDueDate) throw new Error(checkDueDate);

  const checkItems = PurchaseInput.items(items);
  if (checkItems) throw new Error(checkItems);

  const checkNote = PurchaseInput.note(note);
  if (checkNote) throw new Error(checkNote);

  const checkPaymentStatus = PurchaseInput.paymentStatus(payment_status);
  if (checkPaymentStatus) throw new Error(checkPaymentStatus);
};

module.exports = { create };
