import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth.middleware.js";
import orderController from "../controllers/order.controller.js";

const router = express.Router();

router.post("/checkout/webhook", orderController.stripeWebHookHandler)
router.post("/checkout/create-checkout-session", jwtCheck , jwtParse , orderController.createCheckoutSession)

export default router;