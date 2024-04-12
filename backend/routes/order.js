const { Router } = require("express");

const {
    createOrder,
    getOrderDetails,
    myOrders,
    getAllOrders,
    updateOrder,
    deleteOrder,
    getSales
} = require("../controllers/orderController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");


const router = Router();


router.post("/new", isAuthenticatedUser, createOrder );
router.get("/:id", isAuthenticatedUser, getOrderDetails );
router.get("/me/orders", isAuthenticatedUser, myOrders );
router.get("/admin/get_sales", isAuthenticatedUser,authorizeRoles("admin"), getSales );

router.get("/admin/orders", isAuthenticatedUser,authorizeRoles("admin"), getAllOrders );
router.put("/admin/orders/:id", isAuthenticatedUser,authorizeRoles("admin"), updateOrder );
router.delete("/admin/orders/:id", isAuthenticatedUser,authorizeRoles("admin"), deleteOrder );




module.exports = router;
