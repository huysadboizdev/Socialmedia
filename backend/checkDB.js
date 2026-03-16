const mongoose = require('mongoose');
require('dotenv').config();
const notificationModel = require('./models/notificationModel').default;
const orderModel = require('./models/orderModel').default;

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");
  
  const notifs = await notificationModel.find().sort({ createdAt: -1 }).limit(10);
  console.log("Recent Notifications:");
  notifs.forEach(n => console.log(n.message));
  
  const orders = await orderModel.find().sort({ orderDate: -1 }).populate('service').limit(10);
  console.log("\nRecent Orders:");
  orders.forEach(o => console.log(`Order: ${o._id}, Platform: ${o.service ? o.service.platform : 'Unknown'}, Service: ${o.service ? o.service.name : 'Unknown'}`));
  
  mongoose.disconnect();
}

check().catch(console.error);
