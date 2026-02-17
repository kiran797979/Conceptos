function ok(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function fail(res, error, statusCode = 400, details = null) {
  return res.status(statusCode).json({ success: false, error, details });
}

module.exports = {
  ok,
  fail
};
