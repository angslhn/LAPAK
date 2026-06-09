const CustomerModel = require('../models/customer.model');
const TransactionModel = require('../models/transaction.model');

const { CUSTOMER_NOT_FOUND } = require('../helpers/error_codes');

const getAll = async () => {
  try {
    return await CustomerModel.findAll();
  } catch (err) {
    throw new Error(err.message);
  }
};

const create = async (data) => {
  try {
    const { name, phone } = data;

    const customerId = await CustomerModel.create({ name, phone });

    return { id: customerId };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getReceivables = async (data) => {
  try {
    const { id } = data;

    const customer = await CustomerModel.findById(id);

    if (!customer) throw new Error(CUSTOMER_NOT_FOUND);

    const transactions = await TransactionModel.findUnpaidByCustomer(id);

    const total_receivables = transactions.reduce(
      (sum, ut) => sum + ut.total,
      0
    );

    return { customer, total_receivables, transactions };
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getAll, create, getReceivables };
