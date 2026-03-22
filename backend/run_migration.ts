import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { recalculateAllUserDepositStats } from './services/migrationService.js';

dotenv.config();

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        // Use MONGODB_URI as seen in .env
        await mongoose.connect(process.env.MONGODB_URI ?? '');
        console.log('Connected to MongoDB.');
        
        console.log('Starting recalculation...');
        const result = await recalculateAllUserDepositStats();
        console.log('Migration result:', result);
        
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

void run();
