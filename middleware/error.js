const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found `;
    error = new ErrorResponse(404, message);
  }
  // Mongoose duplicate key-value
  if (err.code === 11000) {
    const message = `Duplicate key value`;
    error = new ErrorResponse(400, message);
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(400, message);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
