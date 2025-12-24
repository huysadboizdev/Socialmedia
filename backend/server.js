import express from 'express';
import cors from "cors";
import 'dotenv/config';
import { connect } from 'mongoose';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';

//app config
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//api endpoints
app.get("/", (req, res) => {
  res.send("Server is running");
});
const PORT = process.env.PORT || 4000;
connectDB()
connectCloudinary()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});