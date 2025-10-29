import express, {type Request , type Response} from "express";
import userRoutes from "./routes/user.route.js"
import myRestaurantRoutes from "./routes/my-restaurant.route.js"
import restaurantRoutes from "./routes/restaurant.route.js";
import orderRoutes from "./routes/order.route.js"
import cors from "cors";
import "dotenv/config";
import connectDb from "./config/connectDb.js";
import { v2 as cloudinary} from "cloudinary"

connectDb()
const app = express();

const { CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

if (!CLOUD_NAME || !CLOUDINARY_KEY || !CLOUDINARY_SECRET) {
    throw new Error("Missing Cloudinary environment variables: CLOUD_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET");
}

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUDINARY_KEY,
    api_secret: CLOUDINARY_SECRET
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/health" , async (req :Request , res : Response ) => {
    res.send({message : "Health ok!"})
})

app.use("/api/v1/my/user", userRoutes);
app.use("/api/v1/my/restaurant", myRestaurantRoutes);
app.use("/api/v1/restaurant", restaurantRoutes);
app.use("/api/v1/order", orderRoutes);

const PORT = process.env.PORT || 7000

async function startServer () {
    try {
        // Connect to database
        await connectDb();
        
        // Start your server only after successful DB connection
        app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer()


