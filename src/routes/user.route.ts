import express from "express";
import userController from "../controllers/user.controller.js";
import { jwtCheck, jwtParse } from "../middleware/auth.middleware.js";
import { validateUserRequest } from "../middleware/validation.middleware.js";

const router = express.Router();

router.get("/", jwtCheck , jwtParse,  userController.getCurrentUser)
router.post("/",jwtCheck, userController.createCurrentUser)
router.put("/", jwtCheck, jwtParse, validateUserRequest ,userController.updateCurrentUser)


export default router;