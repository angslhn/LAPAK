function date(value) {
  if (!value) return 'Tanggal tidak boleh kosong';

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(value)) return 'Format tanggal harus YYYY-MM-DD';

  if (isNaN(Date.parse(value))) return 'Tanggal tidak valid';

  return null;
}

function amount(value) {
  if (!value && value !== 0) return 'Nominal tidak boleh kosong';

  const num = Number(value);

  if (isNaN(num)) return 'Nominal harus berupa angka';

  if (num <= 0) return 'Nominal harus lebih dari 0';

  return null;
}

function note(value) {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();

  if (trimmed.length > 500) return 'Catatan maksimal 500 karakter';

  return null;
}

function category(value) {
  if (!value) return 'Kategori tidak boleh kosong';

  const allowed = [
    'sale',
    'purchase',
    'operational',
    'credit_payment',
    'withdrawal',
  ];

  if (!allowed.includes(value)) {
    return `Kategori harus salah satu dari: ${allowed.join(', ')}`;
  }

  return null;
}

module.exports = {
  date,
  amount,
  note,
  category,
};
