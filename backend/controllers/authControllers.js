const { response, request } = require("express");
const User = require("../models/user");
const { asyncHandler } = require("../middlewares/asyncHandler");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/sendToken");
const getResetPasswordTemplate = require("../utils/emailTemplates");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { upload_file, deleteFile } = require("../utils/cloudinary");



// Register user
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({
      message: "El usuario ya existe",
    });
  }
  const user = await User.create({
    name,
    email,
    password,
  });


  sendToken(user, 201, res);
});




// Login user 
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // Find user in the database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check if password is correct
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid or password", 401));
  }

  sendToken(user, 200, res);
});

const loginOut = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Sesión cerrada",
  });
});

const uploadAvatar = asyncHandler(async (req, res, next) => {
  try {
    const avatarResponse = await upload_file(req.body.avatar, "shopit/avatars");

    // remove previous avatar
    if (req?.user?.avatar?.url) {
      await deleteFile(req?.user?.avatar?.public_id);
    }

    // Actualizar el avatar del usuario en la base de datos
    const user = await User.findByIdAndUpdate(req?.user?._id, {
      avatar: avatarResponse,
    });

    if (!user) {
      throw new Error("No se pudo encontrar el usuario para actualizar.");
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    // Manejar errores
    console.error("Error al actualizar el avatar:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  // Buscar el usuario en BD
  const user = await User.findOne({ email: req.body.email });


  if (!user) {
    return next(new ErrorHandler("El usuario no existe", 400));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save();
  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  const message = getResetPasswordTemplate(user?.name, resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Recuperación de contraseña",
      message,
    });
    res.status(200).json({
      success: true,
      message: `El email ha sido enviado al usuario ${user?.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    return next(new ErrorHandler(error?.message, 500));
  }
});





const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);
  res.status(200).json({
    user,
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  //hash the url Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("El token no es válido", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Las contraseñas no coinciden", 400));
  }

  //set the new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req?.user?._id).select("+password");

  // check the previus password
  const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatch) {
    return next(new errorHandler("Las contraseñas no coinciden", 400));
  }

  user.password = req.body.password;
  user.save();
  res.status(200).json({
    success: true,
    message: "Contraseña actualizada",
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req?.user?._id, newUserData, {
    new: true,
  });

  res.status(200).json({
    user,
  });
});

const allUsers = asyncHandler(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    user,
  });
});

const getUserDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new errorHandler(`User not found with id: ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    user,
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  });

  res.status(200).json({
    user,
  });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new errorHandler(`User not found with id: ${req.params.id}`, 400)
    );
  }

  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "Usuario eliminado",
  });
});

module.exports = {
  registerUser,
  loginUser,
  loginOut,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  getUserDetails,
  allUsers,
  deleteUser,
  updateUser,
  uploadAvatar,
};
