function customerId(value) {
  // optional, tapi wajib jika payment_method = 'credit'
  if (value === undefined || value === null || value === '') return null;

  if (!/^\d+$/.test(String(value))) return 'ID pelanggan harus berupa angka';

  if (Number(value) <= 0) return 'ID pelanggan tidak valid';

  return null;
}

function paymentMethod(value) {
  if (!value) return 'Metode pembayaran tidak boleh kosong';

  const allowed = ['cash', 'qris', 'transfer', 'credit', 'debit'];

  if (!allowed.includes(value)) {
    return `Metode pembayaran harus salah satu dari: ${allowed.join(', ')}`;
  }
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

    if (Number(item.product_id) <= 0)
      return `Item ke-${i + 1}: ID produk tidak valid`;

    if (!item.quantity) return `Item ke-${i + 1}: Quantity tidak boleh kosong`;

    if (!/^\d+$/.test(String(item.quantity)))
      return `Item ke-${i + 1}: Quantity harus berupa angka`;

    if (Number(item.quantity) <= 0)
      return `Item ke-${i + 1}: Quantity harus lebih dari 0`;
  }

  return null;
}

function discount(value) {
  if (value === undefined || value === null || value === '') return null;

  const num = Number(value);

  if (isNaN(num)) return 'Diskon harus berupa angka';

  if (num < 0) return 'Diskon tidak boleh negatif';

  return null;
}

function tax(value) {
  if (value === undefined || value === null || value === '') return null;

  const num = Number(value);

  if (isNaN(num)) return 'Pajak harus berupa angka';

  if (num < 0) return 'Pajak tidak boleh negatif';

  return null;
}

function dueDate(value) {
  if (value === undefined || value === null || value === '') return null;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(value))
    return 'Format tanggal jatuh tempo harus YYYY-MM-DD';

  if (isNaN(Date.parse(value))) return 'Tanggal jatuh tempo tidak valid';

  return null;
}

function note(value) {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();

  if (trimmed.length > 500) return 'Catatan maksimal 500 karakter';

  return null;
}

module.exports = {
  customerId,
  paymentMethod,
  items,
  discount,
  tax,
  dueDate,
  note,
};
