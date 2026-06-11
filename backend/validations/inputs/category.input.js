function id(value) {
  if (!value) return 'ID kategori tidak boleh kosong';

  if (!/^\d+$/.test(value)) return 'ID kategori harus berupa angka';

  if (Number(value) <= 0) return 'ID kategori tidak valid';

  return null;
}

function category(value) {
  const trimmed = value.trim();

  if (!trimmed) return 'Kategori tidak boleh kosong';

  if (trimmed.length < 3) return 'Kategori harus terdiri minimal 3 karakter';

  if (trimmed.length > 100)
    return 'Kategori terlalu panjang, maksimal 100 karakter';

  if (!/^[a-zA-Z\s]+$/.test(trimmed))
    return 'Kategori hanya boleh berisi huruf dan spasi';

  return null;
}

module.exports = { id, category };
