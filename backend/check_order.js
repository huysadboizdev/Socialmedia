import mongoose from 'mongoose';
import orderModel from './models/orderModel.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://socialmedia:subhuydev@cluster0.c6hv26s.mongodb.net/?appName=Cluster0')
  .then(async () => {
    const lastOrder = await orderModel.findOne().sort({orderDate: -1}).populate('service');
    console.log('--- LAST ORDER ---');
    console.log(JSON.stringify(lastOrder, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
