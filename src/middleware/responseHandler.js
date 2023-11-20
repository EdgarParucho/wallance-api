exports.success = function(res, { data = null, message = "Ok", statusCode = 200 }) {
  res.status(statusCode).json({ data, message });
}
