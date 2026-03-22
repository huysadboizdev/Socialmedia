import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { recalculateAllUserDepositStats } from './backend/services/migrationService.js';

dotenv.config({ path: './backend/.env' });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');
        await recalculateAllUserDepositStats();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

run();
