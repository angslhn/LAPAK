const calculateTrend = (today, yesterday) => {
  const current = Number(today) || 0;
  const past = Number(yesterday) || 0;

  if (past === 0) {
    return current > 0 ? 100 : 0;
  }

  const trend = ((current - past) / past) * 100;

  return Math.round(trend);
};

module.exports = { calculateTrend };
