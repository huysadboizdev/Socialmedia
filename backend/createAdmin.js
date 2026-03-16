import 'dotenv/config';
import mongoose from 'mongoose';
import userModel from './models/userModel.js';
async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const adminCount = await userModel.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
        const newAdmin = new userModel({
            username: 'Admin System',
            email: 'admin@system.local',
            role: 'admin',
            balance: 0,
            missionBalance: 0,
            password: 'not_applicable'
        });
        await newAdmin.save();
        console.log('Admin user created.');
    }
    else {
        console.log('Admin system user already exists.');
    }
    process.exit(0);
}
run();
