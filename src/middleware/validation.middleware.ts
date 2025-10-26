import type {Request , Response, NextFunction } from "express";
import { body , validationResult } from "express-validator";

const handleValidationError = async (req: Request , res: Response, next : NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
      
    }
    next();
}

export const validateUserRequest = [
  body("name").isString().trim().notEmpty().withMessage("Name cannot be empty"),
  body("addressLine1").isString().trim().withMessage("AddressLine1 must be string"),
  body("city").isString().trim().withMessage("City must be string"),
  body("country").isString().trim().withMessage("City must be string"),
  handleValidationError
];

export const validateRestaurantRequest = [
  body("restaurantName").isString().trim().notEmpty().withMessage("Resaturant name is required"),
  body("city").isString().trim().notEmpty().withMessage("City is required"),
  body("country").isString().trim().notEmpty().withMessage("Country is required"),
  body("deliveryPrice").isFloat({min : 0}).withMessage("delivery Price must be positive number"),
  body("estimatedDeliveryTime").isInt({min : 0}).withMessage("Estimated delivery time must be a postivie integar"),
  body("cuisines")
    .isArray()
    .withMessage("Cuisines must be an array")
    .not()
    .isEmpty()
    .withMessage("Cuisines array cannot be empty"),
  body("menuItems").isArray().withMessage("Menu items must be an array"),
  body("menuItems.*.name").notEmpty().withMessage("Menu item name is required"),
  body("menuItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Menu item price is required and must be a postive number"),
  handleValidationError
]