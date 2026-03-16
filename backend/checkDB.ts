import mongoose from 'mongoose';
import dotenv from 'dotenv';
import notificationModel from './models/notificationModel.js';
import orderModel from './models/orderModel.js';
import serviceModel from './models/serviceModel.js';

dotenv.config();

async function check() {
  const uri = process.env.MONGODB_URI as string;
  await mongoose.connect(`${uri}/socialmedia`);
  console.log("Connected to socialmedia DB");
  
  const notifs = await notificationModel.find().sort({ createdAt: -1 }).limit(10);
  console.log("Recent Notifications:");
  notifs.forEach(n => console.log(`[${n.createdAt}] ${n.message}`));
  
  const orders = await orderModel.find().sort({ orderDate: -1 }).populate('service').limit(10);
  console.log("\nRecent Orders:");
  orders.forEach((o: any) => console.log(`Order: ${o._id}, Platform: ${o.service ? o.service.platform : 'Unknown'}, Service: ${o.service ? o.service.name : 'Unknown'}, User: ${o.userId}`));
  
  mongoose.disconnect();
}

check().catch(console.error);
