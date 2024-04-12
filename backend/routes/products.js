const { Router } = require("express");

const {
  getProducts,
  newProduct,
  getProductsById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteProductReview,
  canUserReview,
  getAdminProduct
} = require("../controllers/productControllers");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

const router = Router();

router.get("/", getProducts);
router.get("/products/:id", getProductsById);

router.post(
  "/admin/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  newProduct
);
router.get(
  "/admin/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAdminProduct
);
router.put(
  "/admin/products/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateProduct
);
router.delete(
  "/admin/products/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);

router.get("/reviews", isAuthenticatedUser, getProductReviews);
router.put("/reviews", isAuthenticatedUser, createProductReview);
router.delete(
    "/admin/reviews",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    deleteProductReview
    );

router.get("/can_review", isAuthenticatedUser, canUserReview);

module.exports = router;
