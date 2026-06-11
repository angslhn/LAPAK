function limit(value) {
  if (value === undefined || value === null || value === '') return null;

  const num = Number(value);

  if (isNaN(num)) return 'Limit harus berupa angka';

  if (!Number.isInteger(num)) return 'Limit harus bilangan bulat';

  if (num < 1) return 'Limit minimal 1';

  if (num > 100) return 'Limit maksimal 100';

  return null;
}

function period(value) {
  if (!value) return 'Periode tidak boleh kosong';

  const allowed = ['week', 'month', 'custom'];

  if (!allowed.includes(value)) {
    return `Periode harus salah satu dari: ${allowed.join(', ')}`;
  }

  return null;
}

function fromDate(value) {
  if (!value) return 'Tanggal dari tidak boleh kosong';

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(value)) return 'Format tanggal dari harus YYYY-MM-DD';

  if (isNaN(Date.parse(value))) return 'Tanggal dari tidak valid';

  return null;
}

function toDate(value) {
  if (!value) return 'Tanggal sampai tidak boleh kosong';

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(value)) return 'Format tanggal sampai harus YYYY-MM-DD';

  if (isNaN(Date.parse(value))) return 'Tanggal sampai tidak valid';

  return null;
}

function rangeDate(fromDate, toDate) {
  const fDate = new Date(fromDate);
  const tDate = new Date(toDate);

  if (fDate > tDate)
    return 'Tanggal dari harus lebih kecil dari tanggal sampai';

  const diffTime = Math.abs(tDate - fDate);

  const limitRangeTime = 1000 * 60 * 60 * 24 * 365.2425;

  if (diffTime > limitRangeTime)
    return 'Maksimal rentang data yang dapat diambil adalah 1 tahun';

  return null;
}

module.exports = { limit, period, fromDate, toDate, rangeDate };
