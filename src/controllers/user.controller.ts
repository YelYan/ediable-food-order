import expressAsyncHandler from "express-async-handler";
import {type Request, type Response } from "express";
import User from "../models/user.model.js";

// @desc    get user
// @route   GET /api/v1/my/user
// @access  Private
const getCurrentUser = expressAsyncHandler(async (req : Request, res : Response): Promise<void> => {
      const userId = req.userId;


      const user = await User.findOne({_id : userId});

      if(!user){
        res.status(404).json({
          message : "User not found!"
        })
      }

      res.status(200).json({
        success : true,
        user
      })
})

// @desc    create user
// @route   POST /api/v1/my/user
// @access  Private
const createCurrentUser = expressAsyncHandler(async (req : Request , res : Response):Promise<void> => {
    const { auth0Id, email, name, addressLine1, city, country } = req.body;

    const existingUser = await User.findOne({auth0Id});

    if (existingUser) {
      res.status(200).json({
        message: "User already exists",
        user: existingUser
      });
      return;
    }

    const newUser = new User({
      auth0Id,
      email,
      name,
      addressLine1,
      city,
      country
    });
    await newUser.save();
    
    res.status(201).json({
      message: "User created successfully",
      user: newUser
    });
})


// @desc    update user
// @route   PUT /api/v1/my/user
// @access  Private
const updateCurrentUser = expressAsyncHandler(async (req : Request , res : Response):Promise<void> => {
  const {name , addressLine1 , city , country} = req.body

  const user = await User.findById(req.userId);
  if(!user) {
     res.status(404).json({message : "User not found"})
     return;
  }

  user.name = name;
  user.addressLine1 = addressLine1;
  user.city = city;
  user.country = country;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user
  });
})


export default {
    getCurrentUser,
    createCurrentUser,
    updateCurrentUser
}