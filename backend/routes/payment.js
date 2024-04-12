const { Router } = require("express");


const { isAuthenticatedUser} = require("../middlewares/auth");
const { stripeCheckoutSession, stripeWebhook } = require("../controllers/paymentController");

const router = Router();


router.post("/checkout_session", isAuthenticatedUser, stripeCheckoutSession
);

router.post("/webhook", stripeWebhook
);





module.exports = router;
