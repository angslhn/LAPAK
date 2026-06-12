const CategoryInput = require('./inputs/category.input');
const ProductInput = require('./inputs/product.input');

const create = (data) => {
  const {
    category_id,
    name,
    sku,
    barcode,
    weight,
    purchase_price,
    selling_price,
    stock,
    minimum_stock,
    unit,
  } = data;

  const checkCategoryId = CategoryInput.id(category_id);
  if (checkCategoryId) throw new Error(checkCategoryId);

  const checkName = ProductInput.productName(name);
  if (checkName) throw new Error(checkName);

  const checkSKU = ProductInput.sku(sku);
  if (checkSKU) throw new Error(checkSKU);

  const checkBarcode = ProductInput.barcode(barcode);
  if (checkBarcode) throw new Error(checkBarcode);

  const checkWeight = ProductInput.weight(weight);
  if (checkWeight) throw new Error(checkWeight);

  const checkPurchasePrice = ProductInput.purchasePrice(purchase_price);
  if (checkPurchasePrice) throw new Error(checkPurchasePrice);

  const checkSellingPrice = ProductInput.sellingPrice(selling_price);
  if (checkSellingPrice) throw new Error(checkSellingPrice);

  const checkStock = ProductInput.stock(stock);
  if (checkStock) throw new Error(checkStock);

  const checkMinimumStock = ProductInput.minimumStock(minimum_stock);
  if (checkMinimumStock) throw new Error(checkMinimumStock);

  const checkUnit = ProductInput.unit(unit);
  if (checkUnit) throw new Error(checkUnit);
};

const update = (data) => {
  const { id } = data;

  const checkId = ProductInput.id(id);
  if (checkId) throw new Error(checkId);

  create(data);
};

module.exports = { create, update };
