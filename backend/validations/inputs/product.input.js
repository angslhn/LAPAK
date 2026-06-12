function id(value) {
  if (!value) return 'ID produk tidak boleh kosong';

  if (!/^\d+$/.test(value)) return 'ID produk harus berupa angka';

  if (Number(value) <= 0) return 'ID produk tidak valid';

  return null;
}

function sku(value) {
  if (value === undefined || value === null || value === '') return null; // optional

  if (typeof value !== 'string') return 'SKU harus berupa string';

  if (value.length > 50) return 'SKU maksimal 50 karakter';

  return null;
}

function barcode(value) {
  if (value === undefined || value === null || value === '') return null; // optional

  if (typeof value !== 'string') return 'Barcode harus berupa string';

  if (value.length > 50) return 'Barcode maksimal 50 karakter';

  return null;
}

function weight(value) {
  if (value === undefined || value === null || value === '') return null; // optional

  const num = Number(value);

  if (isNaN(num)) return 'Berat harus berupa angka';

  if (num < 0) return 'Berat tidak boleh negatif';

  return null;
}

function productName(value) {
  const trimmed = value?.trim();

  if (!trimmed) return 'Nama produk tidak boleh kosong';

  if (trimmed.length < 1) return 'Nama produk minimal 1 karakter';

  if (trimmed.length > 150) return 'Nama produk maksimal 150 karakter';

  return null;
}

function purchasePrice(value) {
  if (!value && value !== 0) return 'Harga beli tidak boleh kosong';

  const num = Number(value);

  if (isNaN(num)) return 'Harga beli harus berupa angka';

  if (num <= 0) return 'Harga beli harus lebih dari 0';

  return null;
}

function sellingPrice(value) {
  if (!value && value !== 0) return 'Harga jual tidak boleh kosong';

  const num = Number(value);

  if (isNaN(num)) return 'Harga jual harus berupa angka';

  if (num <= 0) return 'Harga jual harus lebih dari 0';

  return null;
}

function stock(value) {
  if (!value && value !== 0) return 'Stok tidak boleh kosong';

  const num = Number(value);

  if (isNaN(num)) return 'Stok harus berupa angka';

  if (!Number.isInteger(num)) return 'Stok harus bilangan bulat';

  if (num < 0) return 'Stok tidak boleh kurang dari 0';

  return null;
}

function minimumStock(value) {
  if (!value && value !== 0) return 'Minimum stok tidak boleh kosong';

  const num = Number(value);

  if (isNaN(num)) return 'Minimum stok harus berupa angka';

  if (!Number.isInteger(num)) return 'Minimum stok harus bilangan bulat';

  if (num < 0) return 'Minimum stok tidak boleh kurang dari 0';

  return null;
}

function unit(value) {
  if (!value) return 'Unit tidak boleh kosong';

  const allowed = ['pcs', 'pack', 'bottle', 'kg'];

  if (!allowed.includes(value)) {
    return `Unit harus salah satu dari: ${allowed.join(', ')}`;
  }

  return null;
}

module.exports = {
  id,
  sku,
  barcode,
  weight,
  productName,
  purchasePrice,
  sellingPrice,
  stock,
  minimumStock,
  unit,
};
