function notFoundHandler(_req, res) {
  return res.status(404).json({
    success: false,
    error: 'not_found'
  });
}

function errorHandler(err, _req, res, _next) {
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: 'internal_server_error'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
