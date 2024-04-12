const ErrorHandler = require("../utils/errorHandler");


// const errorHandler = (err, req, res, next) => {
//   let error = {
//     statusCode: err?.statusCode || 500,
//     message: err?.message || "Internal Server Error",
//   };
 

//   // handler invalid mongoose error
//   if (err.name === "CastError") {
//     const message = `Resource not found with id of ${err?.path}`;
//     error = new ErrorHandler(message, 404);
//   }
//   if (err.name === "ValidationError") {
//     const message = Object.values(err.errors).map((value) => value.message);
//     error = new ErrorHandler(message, 400);
//   }
  
//   if (err.name === "SyntaxError") {
//     const message = Object.values(err.errors).map((value) => value.message);
//     error = new ErrorHandler(message, 400);
//   }
  
//   // handler invalid mongoose error
//   if (err.code === 11000) {
//     const message = `duplicate ${Object,keys(err.keyValue)} entered.`;
//     error = new ErrorHandler(message, 400);
//   }

  

//   // handler wrong jwt error
//   if (err.name === "JsonWebTokenError") {
//     const message = `JSON Web Token has invalid. Please`;
//     error = new ErrorHandler(message, 400);
//   }
  
//   // handler wrong jwt error
//   if (err.name === "TokenExpiredError") {
//     const message = `JSON Web Token has expired. Please`;
//     error = new ErrorHandler(message, 400);
//   }

//   if (process.env.NODE_ENV === "DEVELOPMENT") {
//     res.status(error.statusCode).json({
//       message: error.message,
//       error: err,
//       stack: err?.stack,
//     });
//   }

//   if(process.env.NODE_ENV === "PRODUCTION"){
//     res.status(error.statusCode).json({
//       message: error.message,
    
//     });
//   }
//   res.status(error.statusCode).json(response);

// };

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
// Handle Invalid Mongoose ID Error
if (err.name === "CastError") {
  const message = `Resource not found. Invalid: ${err?.path}`;
  error = new ErrorHandler(message, 404);
}

// Handle Validation Error
if (err.name === "ValidationError") {
  const message = Object.values(err.errors).map((value) => value.message);
  error = new ErrorHandler(message, 400);
}

// Handle Mongoose Duplicate Key Error
if (err.code === 11000) {
  const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
  error = new ErrorHandler(message, 400);
}

// Handle wrong JWT Error
if (err.name === "JsonWebTokenError") {
  const message = `JSON Web Token is invalid. Try Again!!!`;
  error = new ErrorHandler(message, 400);
}

// Handle expired JWT Error
if (err.name === "TokenExpiredError") {
  const message = `JSON Web Token is expired. Try Again!!!`;
  error = new ErrorHandler(message, 400);
}
  ErrorHandler(res, statusCode, message);
};

  
  module.exports = {
      
    errorHandler
  };