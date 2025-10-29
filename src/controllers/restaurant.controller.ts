import type { Request, Response } from "express";
import Restaurant from "../models/restaurant.model.js";
import expressAsyncHandler from "express-async-handler";

const getRestaurant = expressAsyncHandler(async (req : Request , res : Response):Promise<void> => {
  const restaurantId = req.params.restaurantId;

  if(!restaurantId){
    res.status(404).json({
      message : "Restaurant not found!"
    })
    return;
  }

  const restaurant = await Restaurant.findById(restaurantId);

  res.status(200).json({
    success : true,
    message : "Resaturant found!",
    data : restaurant,
  })
})

const searchRestaurant = expressAsyncHandler(async (req: Request, res : Response): Promise<void> => {
    const city = req.params.city;

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = (req.query.selectedCuisines as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query:any = {};
    query["city"] = new RegExp(city as string, "i");

    const cityCheck = await Restaurant.countDocuments(query);
    if(cityCheck === 0) {
        res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
      return;
    }

    if (selectedCuisines) {
        // URL = selectedCuisines=burger,pizza,cheese
      const cuisinesArray = selectedCuisines
        .split(",")
        .map((cuisine) => new RegExp(cuisine, "i"));

      query["cuisines"] = { $all: cuisinesArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { restaurantName: searchRegex },
        { cuisines: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // sortOption = "lastUpdated"
    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Restaurant.countDocuments(query);

    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.status(200).json(response);
})

export default {
    getRestaurant,
    searchRestaurant
}