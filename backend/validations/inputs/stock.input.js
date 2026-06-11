function id(value) {
  if (!value) return 'ID produk tidak boleh kosong';

  if (!/^\d+$/.test(String(value))) return 'ID produk harus berupa angka';

  if (Number(value) <= 0) return 'ID produk tidak valid';

  return null;
}

function type(value) {
  if (!value) return 'Tipe penyesuaian tidak boleh kosong';

  const allowed = ['in', 'out'];

  if (!allowed.includes(value)) {
    return `Tipe penyesuaian harus salah satu dari: ${allowed.join(', ')}`;
  }

  return null;
}

function quantity(value) {
  if (!value && value !== 0) return 'Jumlah tidak boleh kosong';

  const num = Number(value);

  if (isNaN(num)) return 'Jumlah harus berupa angka';

  if (!Number.isInteger(num)) return 'Jumlah harus bilangan bulat';

  if (num <= 0) return 'Jumlah harus lebih dari 0';

  return null;
}

function note(value) {
  if (!value || value.trim() === '') return null;

  const trimmed = value.trim();

  if (trimmed.length > 500) return 'Catatan maksimal 500 karakter';

  return null;
}

module.exports = { id, type, quantity, note };
