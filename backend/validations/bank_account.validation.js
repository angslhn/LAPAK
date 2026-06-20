const BankAccountInput = require('./inputs/bank_account.input');

const create = (data) => {
  const { bank_name, account_number, account_owner } = data;

  const checkBankName = BankAccountInput.bankName(bank_name);

  if (checkBankName) throw new Error(checkBankName);

  const checkAccountNumber = BankAccountInput.accountNumber(account_number);

  if (checkAccountNumber) throw new Error(checkAccountNumber);

  const checkAccountOwner = BankAccountInput.accountOwner(account_owner);

  if (checkAccountOwner) throw new Error(checkAccountOwner);
};

const update = (data) => {
  const { bank_name, account_number, account_owner, is_active } = data;

  if (bank_name !== undefined) {
    const checkBankName = BankAccountInput.bankName(bank_name);

    if (checkBankName) throw new Error(checkBankName);
  }

  if (account_number !== undefined) {
    const checkAccountNumber = BankAccountInput.accountNumber(account_number);

    if (checkAccountNumber) throw new Error(checkAccountNumber);
  }

  if (account_owner !== undefined) {
    const checkAccountOwner = BankAccountInput.accountOwner(account_owner);

    if (checkAccountOwner) throw new Error(checkAccountOwner);
  }

  if (is_active !== undefined) {
    const checkIsActive = BankAccountInput.isActive(is_active);

    if (checkIsActive) throw new Error(checkIsActive);
  }
};

module.exports = { create, update };
