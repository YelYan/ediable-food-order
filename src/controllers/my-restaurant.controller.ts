import type { Request, Response } from "express";
import mongoose from "mongoose";
import cloudinary from "cloudinary"
import expressAsyncHandler from "express-async-handler";
import Restaurant from "../models/restaurant.model.js";

// @desc    create my restaurant
// @route   POST /api/v1/my/restaurant
// @access  Private
const createMyRestaurant = expressAsyncHandler(async (req: Request , res : Response): Promise<void> => {
        const userId = req.userId;

        const existingRestaurant = await Restaurant.findOne({user : userId});


        if(existingRestaurant){
            res.status(409).json({
                message : "User restaurant already exists!"
            });
            return;
        }

        const imageUrl = await uploadImage(req.file as Express.Multer.File);
        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = imageUrl;
        restaurant.user = new mongoose.Types.ObjectId(userId);
        restaurant.lastUpdated = new Date();
        
        await restaurant.save();

        res.status(201).json({
            success : true,
            message : "Restaurant created successfully!",
            restaurant
        });
        return;
})

// @desc    get my restaurant
// @route   GET /api/v1/my/restaurant
// @access  Private
const getMyRestaurant = expressAsyncHandler(async (req : Request, res: Response): Promise<void> => {
    const userId = req.userId;

    const existingRestaurant = await Restaurant.findOne({user : userId});
    if (!existingRestaurant) {
       res.status(404).json({ message: "restaurant not found" });
       return;
    }
    res.status(200).json({
        restaurant : existingRestaurant
    })
})


// @desc    update my restaurant
// @route   UPDATE /api/v1/my/restaurant
// @access  Private
const updateMyRestaurant = expressAsyncHandler(async(req : Request, res : Response): Promise<void> => {
    const userId = req.userId;

    const restaurant = await Restaurant.findOne({user : userId});
    if (!restaurant) {
       res.status(404).json({ message: "restaurant not found" });
       return;
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).json({
        success : true,
        message : "Update restaurant successfully",
        restaurant
    })
})

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
    createMyRestaurant,
    getMyRestaurant,
    updateMyRestaurant
}