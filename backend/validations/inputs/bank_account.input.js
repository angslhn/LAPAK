function bankName(value) {
  const trimmed = value?.trim();

  if (!trimmed) return 'Nama bank tidak boleh kosong';

  if (trimmed.length < 2) return 'Nama bank minimal 2 karakter';

  if (trimmed.length > 100) return 'Nama bank maksimal 100 karakter';

  return null;
}

function accountNumber(value) {
  const trimmed = value?.trim();

  if (!trimmed) return 'Nomor rekening tidak boleh kosong';

  if (!/^\d+$/.test(trimmed)) return 'Nomor rekening harus berupa angka';

  if (trimmed.length < 5) return 'Nomor rekening minimal 5 digit';

  if (trimmed.length > 50) return 'Nomor rekening maksimal 50 digit';

  return null;
}

function accountOwner(value) {
  const trimmed = value?.trim();

  if (!trimmed) return 'Nama pemilik rekening tidak boleh kosong';

  if (trimmed.length < 2) return 'Nama pemilik rekening minimal 2 karakter';

  if (trimmed.length > 150)
    return 'Nama pemilik rekening maksimal 150 karakter';

  return null;
}

function isActive(value) {
  if (value === undefined || value === null || value === '') return null;

  if (typeof value === 'boolean') return null;

  if (value === 'true' || value === 'false') return null;

  return 'is_active harus berupa boolean (true/false)';
}

module.exports = {
  bankName,
  accountNumber,
  accountOwner,
  isActive,
};
