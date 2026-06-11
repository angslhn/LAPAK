function name(value) {
  const trimmed = value.trim();

  if (!trimmed) return 'Nama tidak boleh kosong';

  if (trimmed.length < 1) return 'Nama harus terdiri minimal 1 karakter';

  if (trimmed.length > 100)
    return 'Nama terlalu panjang, maksimal 100 karakter';

  if (!/^[a-zA-Z\s]+$/.test(trimmed))
    return 'Nama hanya boleh berisi huruf dan spasi';

  return null;
}

function token(value) {
  if (value.length !== 64) return 'Token tidak valid';

  if (!/^[a-f0-9]{64}$/.test(value)) return 'Token tidak valid';

  return null;
}

function email(value) {
  if (value.length > 255) return 'Email terlalu panjang, maksimal 255 karakter';

  const isValidFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    value
  );
  if (!isValidFormat) return 'Format email tidak valid';

  if (/\.{2,}/.test(value.split('@')[0] ?? ''))
    return 'Bagian lokal email tidak boleh mengandung titik berurutan';

  const localPart = value.split('@')[0] ?? '.';

  if (localPart.startsWith('.') || localPart.endsWith('.'))
    return 'Email tidak boleh diawali atau diakhiri dengan titik';

  return null;
}

function phone(value) {
  if (!value.startsWith('0'))
    return 'Nomor telepon harus diawali dengan "0" (contoh: 081234567890)';

  if (!/^\d+$/.test(value)) return 'Nomor telepon hanya boleh angka';

  if (value.length < 7) return 'Nomor telepon terlalu pendek, minimal 7 digit';

  if (value.length > 15)
    return 'Nomor telepon terlalu panjang, maksimal 15 digit';

  return null;
}

const password = (value) => {
  const isLength = value.length;

  if (isLength < 8) return 'Kata sandi terlalu pendek, minimal 8 karakter';

  if (isLength > 64) return 'Kata sandi terlalu panjang, maksimal 64 karakter';

  const isLowercase = /[a-z]+/.test(value);
  const isUppercase = /[A-Z]+/.test(value);
  const isNumber = /\d+/.test(value);
  const isSymbols = /[!@#$%^&*()_+=.?-]+/.test(value);
  const isDenied = /[^a-zA-Z0-9!@#$%^&*()_+=.?-]+/.test(value);

  if (isDenied) return 'Karakter terlarang telah digunakan';

  if (!isLowercase)
    return 'Kata sandi harus mengandung setidaknya satu huruf kecil';

  if (!isUppercase)
    return 'Kata sandi harus mengandung setidaknya satu huruf kapital';

  if (!isNumber) return 'Kata sandi harus mengandung setidaknya satu angka';

  if (!isSymbols) return 'Kata sandi harus mengandung setidaknya satu simbol';

  return null;
};

function storeName(value) {
  const trimmed = value?.trim();

  if (!trimmed) return null;

  if (trimmed.length < 2) return 'Nama toko minimal 2 karakter';

  if (trimmed.length > 150) return 'Nama toko maksimal 150 karakter';

  if (!/^[a-zA-Z0-9\s.,\-']+$/.test(trimmed)) {
    return 'Nama toko hanya boleh berisi huruf, angka, spasi, titik, koma, strip, atau apostrof';
  }

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

function role(value) {
  const allowedRoles = ['owner', 'cashier'];

  if (!value) return 'Role harus dipilih';

  if (!allowedRoles.includes(value.toLowerCase())) {
    return `Role harus salah satu dari: ${allowedRoles.join(', ')}`;
  }

  return null;
}

module.exports = {
  name,
  token,
  email,
  phone,
  password,
  storeName,
  address,
  role,
};
