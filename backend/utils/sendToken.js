const { response, request } = require("express");
const User = require("../models/user");

const sendToken = (user, statusCode, res, isAuthenticated= true) => {
  if (isAuthenticated) {
    //create token
    const token = user.getJwtToken();

    //option for cookie
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
      httpOnly: true,
    };

    res.status(statusCode).cookie("token", token, options).json({
      token,
    });
  } else {
    res.status(statusCode).json({
      message: "Authentication required. Please log in.",
    });
  }
};
module.exports = sendToken;
