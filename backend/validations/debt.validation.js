const DebtInput = require('./inputs/debt.input');

const updateCustomerDebt = (data) => {
  const { customer_name, customer_phone, due_date, note } = data;

  const checkName = DebtInput.customerName(customer_name);
  if (checkName) throw new Error(checkName);

  const checkPhone = DebtInput.customerPhone(customer_phone);
  if (checkPhone) throw new Error(checkPhone);

  const checkDueDate = DebtInput.dueDate(due_date);
  if (checkDueDate) throw new Error(checkDueDate);

  const checkNote = DebtInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

const payCustomerDebt = (data) => {
  const { payment_amount, payment_date, payment_method, note } = data;

  const checkAmount = DebtInput.paymentAmount(payment_amount);
  if (checkAmount) throw new Error(checkAmount);

  const checkDate = DebtInput.paymentDate(payment_date);
  if (checkDate) throw new Error(checkDate);

  const checkMethod = DebtInput.paymentMethod(payment_method);
  if (checkMethod) throw new Error(checkMethod);

  const checkNote = DebtInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

const payCustomerDebtPartial = (data) => {
  return payCustomerDebt(data);
};

const deleteCustomerDebt = (data) => {
  const { id } = data;

  const checkId = DebtInput.transactionId(id);
  if (checkId) throw new Error(checkId);
};

const updateSupplierDebt = (data) => {
  const { supplier_id, due_date, note } = data;

  const checkSupplierId = DebtInput.supplierId(supplier_id);
  if (checkSupplierId) throw new Error(checkSupplierId);

  const checkDueDate = DebtInput.dueDate(due_date);
  if (checkDueDate) throw new Error(checkDueDate);

  const checkNote = DebtInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

const paySupplierDebt = (data) => {
  const { payment_amount, payment_method, note } = data;

  const checkAmount = DebtInput.paymentAmount(payment_amount);
  if (checkAmount) throw new Error(checkAmount);

  const checkMethod = DebtInput.paymentMethod(payment_method);
  if (checkMethod) throw new Error(checkMethod);

  const checkNote = DebtInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

const paySupplierDebtPartial = (data) => {
  return paySupplierDebt(data);
};

const deleteSupplierDebt = (data) => {
  const { id } = data;

  const checkId = DebtInput.purchaseId(id);
  if (checkId) throw new Error(checkId);
};

module.exports = {
  updateCustomerDebt,
  payCustomerDebt,
  payCustomerDebtPartial,
  deleteCustomerDebt,
  updateSupplierDebt,
  paySupplierDebt,
  paySupplierDebtPartial,
  deleteSupplierDebt,
};
