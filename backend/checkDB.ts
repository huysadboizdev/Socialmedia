import mongoose from 'mongoose';
import dotenv from 'dotenv';
import notificationModel from './models/notificationModel.js';
import orderModel from './models/orderModel.js';

dotenv.config();

async function check() {
  const uri = process.env.MONGODB_URI ?? '';
  await mongoose.connect(`${uri}/socialmedia`);
  console.log("Connected to socialmedia DB");
  
  const notifs = await notificationModel.find().sort({ createdAt: -1 }).limit(10);
  console.log("Recent Notifications:");
  notifs.forEach(n => {
    console.log(`[${n.createdAt.toLocaleString()}] ${n.message}`);
  });
  
  const orders = await orderModel.find().sort({ orderDate: -1 }).populate<{ service: { platform: string, name: string } | null }>('service').limit(10);
  console.log("\nRecent Orders:");
  orders.forEach((o) => {
    const platform = o.service?.platform ?? 'Unknown';
    const name = o.service?.name ?? 'Unknown';
    console.log(`Order: ${o._id.toString()}, Platform: ${platform}, Service: ${name}, User: ${o.userId.toString()}`);
  });
  
  await mongoose.disconnect();
}

void check().catch(console.error);
