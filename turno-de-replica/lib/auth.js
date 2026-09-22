function requireAdmin(req) {
  var expected = process.env.CONTENT_ADMIN_TOKEN;
  var authorization = req.headers.authorization || '';
  var token = authorization.indexOf('Bearer ') === 0
    ? authorization.slice(7)
    : req.headers['x-admin-token'];

  if (!expected || token !== expected) {
    var error = new Error('No autorizado');
    error.statusCode = 401;
    throw error;
  }
}

module.exports = { requireAdmin };
