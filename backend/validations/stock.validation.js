const StockInput = require('./inputs/stock.input');

const adjust = (data) => {
  const { id, type, quantity, note } = data;

  const checkId = StockInput.id(id);
  if (checkId) throw new Error(checkId);

  const checkType = StockInput.type(type);
  if (checkType) throw new Error(checkType);

  const checkQuantity = StockInput.quantity(quantity);
  if (checkQuantity) throw new Error(checkQuantity);

  const checkNote = StockInput.note(note);
  if (checkNote) throw new Error(checkNote);
};

module.exports = { adjust };
