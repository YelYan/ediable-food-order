import type { Request, Response } from "express";
import mongoose from "mongoose";
import cloudinary from "cloudinary"
import expressAsyncHandler from "express-async-handler";
import Restaurant from "../models/restaurant.model.js";
import Order from "../models/order.model.js";

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

// @desc    get my restaurant order
// @route   UPDATE /api/v1/my/restaurant/order
// @access  Private
const getmyRestaurantOrders = expressAsyncHandler(async (req : Request, res : Response): Promise<void> => {
    const userId = req.userId;
  
    const restaurant = await Restaurant.findOne({user : userId});
    if (!restaurant) {
       res.status(404).json({ message: "restaurant not found" });
       return;
    }


    const orders = await Order.find({restaurant: restaurant._id}).populate("restaurant").populate("user");
    res.status(200).json({
        success : true,
        message : "Get restaurant order successfully!",
        data : orders
    })
})

// @desc    update my restaurant order
// @route   UPDATE /api/v1/my/restaurant/order
// @access  Private
const updateMyRestaurantOrdersStatus = expressAsyncHandler(async (req : Request , res : Response):Promise<void> => {
    const orderId = req.params.orderId;
    const status = req.body.status;
    const userId = req.userId;
   

    const order = await Order.findById(orderId);

    if(!order) {
        res.status(404).json({
            message : "Order not found!"
        })
        return
    }


    const restaurant = await Restaurant.findById(order.restaurant);

    if(restaurant?.user?._id.toString() !== userId){
        res.status(401).send()
        return;
    }

    order.status = status;
    await order.save()

    res.status(200).json({
        success : true,
        message : "Update order status successfully",
        data : order
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
    getmyRestaurantOrders,
    updateMyRestaurantOrdersStatus,
    getMyRestaurant,
    updateMyRestaurant
}