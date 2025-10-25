import express, {type Request , type Response} from "express";
import userRoutes from "./routes/user.route.js"
import cors from "cors";
import "dotenv/config";
import connectDb from "./config/connectDb.js";

connectDb()
const app = express();

app.use(express.json())
app.use(cors());

app.get("/health" , async (req :Request , res : Response ) => {
    res.send({message : "Health ok!"})
})

app.use("/api/v1/my/user", userRoutes);

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


