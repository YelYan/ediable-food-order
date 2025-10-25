import mongoose from "mongoose";

async function connectDb (): Promise<void> {

    try {

        if(!process.env.MONGO_URL){
            throw new Error("MONGO_URL is not defined in environment variables");
        }

          // Connection options
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        
        await mongoose.connect(process.env.MONGO_URL, options);
        console.log("✅ Successfully connected to MongoDB!");
    } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("Could not connect to MongoDB. Please ensure MongoDB is running.");
      } else if (error.message.includes("authentication failed")) {
        console.error("Authentication failed. Please check your credentials.");
      } else if (error.message.includes("MONGO_URL")) {
        console.error("Please set the MONGO_URL environment variable.");
      }
    }
    
    // Re-throw the error to let the caller handle it
    throw error;
    }
}

export default connectDb;