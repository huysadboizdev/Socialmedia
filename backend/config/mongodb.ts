import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("MongoDB connected successfully");
    });

    const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
    await mongoose.connect(`${uri}/socialmedia`);
}

export default connectDB;
