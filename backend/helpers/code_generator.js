const makeInvoiceCode = (seq) => {
  const now = new Date();

  const dateStr =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  const seqStr = String(seq).padStart(4, '0');

  return `LPK/${dateStr}/${seqStr}`;
};

const makeReceiptNumber = (seq) => {
  const now = new Date();

  const dateStr =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  const seqStr = String(seq).padStart(4, '0');

  return `PO/${dateStr}/${seqStr}`;
};

module.exports = { makeInvoiceCode, makeReceiptNumber };
