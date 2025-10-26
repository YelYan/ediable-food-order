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

        console.log(userId, "user IDD")
        const existingRestaurant = await Restaurant.findOne({user : userId});


        if(existingRestaurant){
            res.status(409).json({
                message : "User restaurant already exists!"
            });
            return;
        }

        const image = req.file as Express.Multer.File;
        const base64Image = Buffer.from(image.buffer).toString("base64");
        const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = uploadResponse.url
        restaurant.user = new mongoose.Types.ObjectId(userId);
        restaurant.lastUpdated = new Date();
        
        await restaurant.save();

        res.status(200).json({
            success : true,
            message : "Restaurant created successfully!",
            restaurant
        });
        return;
})

export default {
    createMyRestaurant
}