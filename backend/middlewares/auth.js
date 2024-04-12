const { response, request } = require("express");
const { asyncHandler } = require("../middlewares/asyncHandler");
const ErrorHandler= require("../utils/errorHandler");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const isAuthenticatedUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Login first to access this resource", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ErrorHandler("Token expired. Please log in again.", 401));
    } else {
      return next(new ErrorHandler("Invalid token", 401));
    }
  }
});

// Authorize user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};


module.exports = {
  isAuthenticatedUser,
  authorizeRoles
};
