import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { jwtCheck, jwtParse } from "../middleware/auth.middleware.js";
import { validateRestaurantRequest } from "../middleware/validation.middleware.js";
import myRestaurantController from "../controllers/my-restaurant.controller.js";

const router = express.Router();

router.post(
    "/",
    upload.single("imageFile"),
    validateRestaurantRequest,
    jwtCheck,
    jwtParse,
    myRestaurantController.createMyRestaurant
)

export default router

