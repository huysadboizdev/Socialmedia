const { MongoClient } = require('mongodb');
require('dotenv').config();

console.log("Starting DB check script...");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in .env");
    return;
  }
  console.log("Connecting to:", uri.replace(/:([^:@]+)@/, ':***@'));
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    
    // Check if the DB name is in the URI or we need to specify it
    const db = client.db('test'); // mongoose default if not specified in connection string usually? 
    // Or we will just let the driver use the default from URI
    const actualDb = client.db();
    
    const notifications = await actualDb.collection('notifications').find().sort({ createdAt: -1 }).limit(10).toArray();
    console.log("--- RECENT NOTIFICATIONS ---");
    notifications.forEach(n => console.log(`[${n.createdAt}] ${n.message} (Read: ${n.isRead})`));

    const orders = await actualDb.collection('orders').aggregate([
      { $sort: { orderDate: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'serviceDetails' } }
    ]).toArray();
    
    console.log("\n--- RECENT ORDERS ---");
    orders.forEach(o => {
      const s = o.serviceDetails[0] || {};
      console.log(`Order: ${o._id}, Platform: ${s.platform}, Name: ${s.name}, Qty: ${o.quantity}, Date: ${o.orderDate}`);
    });

  } catch (e) {
    console.error("Error during execution:", e);
  } finally {
    await client.close();
    console.log("Closed connection.");
  }
}

main().catch(console.error);
