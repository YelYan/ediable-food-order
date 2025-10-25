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