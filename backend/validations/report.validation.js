const ReportInput = require('./inputs/report.input');

const revenue = (data) => {
  const { period, from, to } = data;

  const checkPeriod = ReportInput.period(period);
  if (checkPeriod) throw new Error(checkPeriod);

  if (period === 'custom') {
    const checkFromDate = ReportInput.fromDate(from);
    if (checkFromDate) throw new Error(checkFromDate);

    const checkToDate = ReportInput.toDate(to);
    if (checkToDate) throw new Error(checkToDate);

    const checkRangeDate = ReportInput.rangeDate(from, to);
    if (checkRangeDate) throw new Error(checkRangeDate);
  }
};

const topProduct = (data) => {
  const { limit, period, from, to } = data;

  const checkLimit = ReportInput.limit(limit);
  if (checkLimit) throw new Error(checkLimit);

  const checkPeriod = ReportInput.period(period);
  if (checkPeriod) throw new Error(checkPeriod);

  if (period === 'custom') {
    const checkFromDate = ReportInput.fromDate(from);
    if (checkFromDate) throw new Error(checkFromDate);

    const checkToDate = ReportInput.toDate(to);
    if (checkToDate) throw new Error(checkToDate);

    const checkRangeDate = ReportInput.rangeDate(from, to);
    if (checkRangeDate) throw new Error(checkRangeDate);
  }
};

module.exports = { revenue, topProduct };
