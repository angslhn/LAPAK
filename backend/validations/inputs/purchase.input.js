function supplierId(value) {
  if (!value) return 'ID supplier tidak boleh kosong';

  if (!/^\d+$/.test(String(value))) return 'ID supplier harus berupa angka';

  if (Number(value) <= 0) return 'ID supplier tidak valid';

  return null;
}

function date(value) {
  if (!value) return 'Tanggal pembelian tidak boleh kosong';

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(value)) return 'Format tanggal harus YYYY-MM-DD';

  if (isNaN(Date.parse(value))) return 'Tanggal pembelian tidak valid';

  return null;
}

function dueDate(value) {
  if (!value || value.trim() === '') return null;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(value))
    return 'Format tanggal jatuh tempo harus YYYY-MM-DD';

  if (isNaN(Date.parse(value))) return 'Tanggal pembelian tidak valid';

  return null;
}

function items(value) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return 'Item produk tidak boleh kosong';
  }

  for (let i = 0; i < value.length; i++) {
    const item = value[i];

    if (!item.product_id)
      return `Item ke-${i + 1}: ID produk tidak boleh kosong`;

    if (!/^\d+$/.test(String(item.product_id)))
      return `Item ke-${i + 1}: ID produk harus berupa angka`;

    if (!item.quantity) return `Item ke-${i + 1}: Quantity tidak boleh kosong`;

    if (!/^\d+$/.test(String(item.quantity)))
      return `Item ke-${i + 1}: Quantity harus berupa angka`;

    if (Number(item.quantity) <= 0)
      return `Item ke-${i + 1}: Quantity harus lebih dari 0`;

    if (!item.purchase_price && item.purchase_price !== 0)
      return `Item ke-${i + 1}: Harga beli tidak boleh kosong`;

    if (isNaN(Number(item.purchase_price)))
      return `Item ke-${i + 1}: Harga beli harus berupa angka`;

    if (Number(item.purchase_price) < 0)
      return `Item ke-${i + 1}: Harga beli tidak boleh negatif`;
  }

  return null;
}

function note(value) {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();

  if (trimmed.length > 500) return 'Catatan maksimal 500 karakter';

  return null;
}

module.exports = { supplierId, receiptNumber, date, dueDate, items, note };
