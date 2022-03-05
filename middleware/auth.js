const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');

const ErrorResponse = require('../utils/errorResponse');

const User = require('../model/User');

// Protect routes middleware
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // grab the token from Bearer token in header

    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  //   Make sure token exists
  if (!token) {
    return next(new ErrorResponse(401, 'Not authorized to access this route'));
  }
  try {
    //   Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse(401, 'No authorized to access this route'));
  }
});

// Grant access to specific roles

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
module.exports = { protect, authorize };
