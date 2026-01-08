import type { Document, InferSchemaType } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['attendance', 'mission', 'withdraw', 'deposit', 'adjustment', 'payment', 'transfer'], default: 'deposit' },
    description: { type: String },
    oldBalance: { type: Number, default: 0 },
    newBalance: { type: Number, default: 0 },
    balanceType: { type: String, enum: ['profile', 'mission'], default: 'profile' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    withdrawalDetails: {
        method: { type: String, enum: ['web', 'bank'] },
        bankName: { type: String },
        bankAccount: { type: String },
        qrCode: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});

type TransactionRecord = InferSchemaType<typeof transactionSchema>;
export interface ITransaction extends TransactionRecord, Document {}

const transactionModel = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default transactionModel;
