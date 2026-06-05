const ok = (res, data, message = 'Success') =>
  res.status(200).json({
    success: true,
    message,
    data,
  });

const created = (res, data, message = 'Created') =>
  res.status(201).json({
    success: true,
    message,
    data,
  });

const error = (
  res,
  code = 'INTERNAL_SERVER_ERROR',
  message,
  httpStatus = 500
) =>
  res.status(httpStatus).json({
    success: false,
    code,
    message,
    data: null,
  });

module.exports = { ok, created, error };
