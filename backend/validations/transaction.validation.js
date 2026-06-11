const TransactionInput = require('./inputs/transaction.input');

const create = (data) => {
  const { customer_id, payment_method, items, discount, tax, due_date, note } =
    data;

  const checkCustomerId = TransactionInput.customerId(customer_id);
  if (checkCustomerId) throw new Error(checkCustomerId);

  const checkPaymentMethod = TransactionInput.paymentMethod(payment_method);
  if (checkPaymentMethod) throw new Error(checkPaymentMethod);

  const checkItems = TransactionInput.items(items);
  if (checkItems) throw new Error(checkItems);

  const checkDiscount = TransactionInput.discount(discount);
  if (checkDiscount) throw new Error(checkDiscount);

  const checkTax = TransactionInput.tax(tax);
  if (checkTax) throw new Error(checkTax);

  const checkDueDate = TransactionInput.dueDate(due_date);
  if (checkDueDate) throw new Error(checkDueDate);

  const checkNote = TransactionInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

module.exports = { create };
