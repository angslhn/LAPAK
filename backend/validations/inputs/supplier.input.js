function id(value) {
  if (!value) return 'ID supplier tidak boleh kosong';

  if (!/^\d+$/.test(value)) return 'ID supplier harus berupa angka';

  if (Number(value) <= 0) return 'ID supplier tidak valid';

  return null;
}

function name(value) {
  const trimmed = value?.trim();

  if (!trimmed) return 'Nama supplier tidak boleh kosong';

  if (trimmed.length < 2) return 'Nama supplier minimal 2 karakter';

  if (trimmed.length > 150) return 'Nama supplier maksimal 150 karakter';

  return null;
}

function phone(value) {
  if (!value || value.trim() === '') return null; // optional

  const cleaned = value.trim();

  const digitsOnly = cleaned.replace(/[^0-9]/g, '');

  if (digitsOnly.length < 7) return 'Nomor telepon minimal 7 digit';

  if (digitsOnly.length > 15) return 'Nomor telepon maksimal 15 digit';

  return null;
}

function email(value) {
  if (!value || value.trim() === '') return null; // optional

  const trimmed = value.trim();

  if (trimmed.length > 255) return 'Email maksimal 255 karakter';

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) return 'Format email tidak valid';

  return null;
}

function contactPerson(value) {
  if (!value || value.trim() === '') return null; // optional

  const trimmed = value.trim();

  if (trimmed.length < 2) return 'Kontak person minimal 2 karakter';

  if (trimmed.length > 100) return 'Kontak person maksimal 100 karakter';

  return null;
}

function address(value) {
  const trimmed = value?.trim();

  if (!trimmed) return null;

  if (trimmed.length < 5) return 'Alamat minimal 5 karakter';

  if (trimmed.length > 500) return 'Alamat maksimal 500 karakter';

  if (!/^[a-zA-Z0-9\s.,/#\-]+$/.test(trimmed)) {
    return 'Alamat hanya boleh berisi huruf, angka, spasi, koma, titik, strip, garis miring, atau pagar';
  }

  return null;
}

function note(value) {
  if (!value || value.trim() === '') return null; // optional

  const trimmed = value.trim();

  if (trimmed.length > 500) return 'Catatan maksimal 500 karakter';

  return null;
}

module.exports = { id, name, phone, email, contactPerson, address, note };
