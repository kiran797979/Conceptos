function getHealth(_req, res) {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getHealth
};
