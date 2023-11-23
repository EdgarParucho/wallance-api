class CustomError extends Error {
  constructor(code, message) {
    super(code, message);
    this.statusCode = code;
    this.message = message;
    this.data = null;
  }
}

module.exports = CustomError;