function id(value) {
  if (!value) return 'ID pelanggan tidak boleh kosong';

  if (!/^\d+$/.test(value)) return 'ID pelanggan harus berupa angka';

  if (Number(value) <= 0) return 'ID pelanggan tidak valid';

  return null;
}

function name(value) {
  const trimmed = value?.trim();

  if (!trimmed) return 'Nama pelanggan tidak boleh kosong';

  if (trimmed.length < 2) return 'Nama pelanggan minimal 2 karakter';

  if (trimmed.length > 150) return 'Nama pelanggan maksimal 150 karakter';

  if (!/^[a-zA-Z\s]+$/.test(trimmed))
    return 'Nama pelanggan hanya boleh berisi huruf dan spasi';

  return null;
}

function phone(value) {
  if (!value || value.trim() === '') return null;

  const cleaned = value.trim();

  const digitsOnly = cleaned.replace(/[^0-9]/g, '');

  if (digitsOnly.length < 7) return 'Nomor telepon minimal 7 digit';

  if (digitsOnly.length > 15) return 'Nomor telepon maksimal 15 digit';

  return null;
}

module.exports = { id, name, phone };
