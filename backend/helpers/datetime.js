const getLocalDate = () => {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
};

const getLocalPastDate = (day = 0) => {
  const time = Date.now() - day * 86400000;

  return new Date(time).toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Jakarta',
  });
};

const getPastDateFromDate = (date, day = 1) => {
  const d = new Date(date);
  d.setDate(d.getDate() - day);
  return d.toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Jakarta',
  });
};

const getLocalTime = () => {
  return new Date().toLocaleTimeString('sv-SE', { timeZone: 'Asia/Jakarta' });
};

const getLocalDateTime = () => {
  const now = new Date();

  const datePart = now.toLocaleDateString('sv-SE', {
    timeZone: 'Asia/Jakarta',
  });
  const timePart = now.toLocaleTimeString('sv-SE', {
    timeZone: 'Asia/Jakarta',
  });

  return `${datePart} ${timePart}`;
};

const isDayName = (date) => {
  const index = new Date(date).getDay();

  return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][index];
};

module.exports = {
  getLocalDate,
  getLocalPastDate,
  getPastDateFromDate,
  getLocalTime,
  getLocalDateTime,
  isDayName,
};
