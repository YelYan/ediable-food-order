import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { jwtCheck, jwtParse } from "../middleware/auth.middleware.js";
import { validateRestaurantRequest } from "../middleware/validation.middleware.js";
import myRestaurantController from "../controllers/my-restaurant.controller.js";

const router = express.Router();

router.get("/", jwtCheck , jwtParse , myRestaurantController.getMyRestaurant)
router.post(
    "/",
    upload.single("imageFile"),
    validateRestaurantRequest,
    jwtCheck,
    jwtParse,
    myRestaurantController.createMyRestaurant
)
router.put(
    "/",
    upload.single("imageFile"),
    validateRestaurantRequest,
    jwtCheck,
    jwtParse,
    myRestaurantController.updateMyRestaurant
);

export default router

