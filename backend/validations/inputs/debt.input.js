function id(value) {
  if (!value) return 'ID tidak boleh kosong';

  if (!/^\d+$/.test(String(value))) return 'ID harus berupa angka';

  if (Number(value) <= 0) return 'ID tidak valid';

  return null;
}

function supplierId(value) {
  if (!value) return 'ID supplier tidak boleh kosong';

  if (!/^\d+$/.test(String(value))) return 'ID supplier harus berupa angka';

  if (Number(value) <= 0) return 'ID supplier tidak valid';

  return null;
}

function purchaseId(value) {
  if (!value) return 'ID pembelian tidak boleh kosong';

  if (!/^\d+$/.test(String(value))) return 'ID pembelian harus berupa angka';

  if (Number(value) <= 0) return 'ID pembelian tidak valid';

  return null;
}

function transactionId(value) {
  if (!value) return 'ID transaksi tidak boleh kosong';

  if (!/^\d+$/.test(String(value))) return 'ID transaksi harus berupa angka';

  if (Number(value) <= 0) return 'ID transaksi tidak valid';

  return null;
}

function amount(value, allowZero = false) {
  if (!value && value !== 0) return 'Nominal tidak boleh kosong';

  const num = Number(value);

  if (isNaN(num)) return 'Nominal harus berupa angka';

  if (!allowZero && num <= 0) return 'Nominal harus lebih dari 0';

  return null;
}

function paymentAmount(value) {
  if (!value && value !== 0) return 'Jumlah pembayaran tidak boleh kosong';

  const num = Number(value);

  if (isNaN(num)) return 'Jumlah pembayaran harus berupa angka';

  if (num <= 0) return 'Jumlah pembayaran harus lebih dari 0';

  return null;
}

function date(value) {
  if (!value) return 'Tanggal tidak boleh kosong';

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(value)) return 'Format tanggal harus YYYY-MM-DD';

  if (isNaN(Date.parse(value))) return 'Tanggal tidak valid';

  return null;
}

function dueDate(value) {
  return date(value);
}

function paymentDate(value) {
  return date(value);
}

function receiptNumber(value) {
  if (!value || value.trim() === '') return null;

  if (value.length > 50) return 'Nomor kwitansi maksimal 50 karakter';

  return null;
}

function note(value) {
  if (!value || value.trim() === '') return null;

  if (value.length > 500) return 'Catatan maksimal 500 karakter';

  return null;
}

function paymentMethod(value) {
  if (!value) return null;

  const allowed = ['cash', 'transfer', 'qris'];

  if (!allowed.includes(value)) {
    return `Metode pembayaran harus salah satu dari: ${allowed.join(', ')}`;
  }

  return null;
}

function customerName(value) {
  const trimmed = value?.trim();
  if (!trimmed) return 'Nama pelanggan tidak boleh kosong';

  if (trimmed.length < 2) return 'Nama pelanggan minimal 2 karakter';

  if (trimmed.length > 150) return 'Nama pelanggan maksimal 150 karakter';

  return null;
}

function customerPhone(value) {
  if (!value || value.trim() === '') return null;

  const cleaned = value.trim();
  const digitsOnly = cleaned.replace(/[^0-9]/g, '');

  if (digitsOnly.length < 7) return 'Nomor telepon minimal 7 digit';

  if (digitsOnly.length > 15) return 'Nomor telepon maksimal 15 digit';

  return null;
}

function customerAddress(value) {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();

  if (trimmed.length < 5) return 'Alamat minimal 5 karakter';

  if (trimmed.length > 500) return 'Alamat maksimal 500 karakter';

  return null;
}

module.exports = {
  id,
  supplierId,
  purchaseId,
  transactionId,
  amount,
  paymentAmount,
  date,
  dueDate,
  paymentDate,
  receiptNumber,
  note,
  paymentMethod,
  customerName,
  customerPhone,
  customerAddress,
};
