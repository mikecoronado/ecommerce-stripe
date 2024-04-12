const { Router } = require("express");

const {
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
  uploadAvatar
} = require("../controllers/authControllers");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", loginOut);

router.post("/password/forgot", forgotPassword);
router.put("/resetPassword/:token", resetPassword);

router.get("/me", isAuthenticatedUser, getUserProfile);
router.put("/me/update", isAuthenticatedUser, updateProfile);

router.put("/password/update", isAuthenticatedUser, updatePassword);
router.put("/me/upload_avatar", isAuthenticatedUser, uploadAvatar);

router.get("/allUsers", isAuthenticatedUser,authorizeRoles("admin"), allUsers);

router.get("/allUsers/:id",isAuthenticatedUser,authorizeRoles("admin"), getUserDetails);


router.delete("/allUsers/:id",isAuthenticatedUser,authorizeRoles("admin"), deleteUser);
router.put("/allUsers/:id",isAuthenticatedUser,authorizeRoles("admin"), updateUser);



module.exports = router;
