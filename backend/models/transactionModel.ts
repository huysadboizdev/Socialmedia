import type { Document, InferSchemaType } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

type TransactionRecord = InferSchemaType<typeof transactionSchema>;
export interface ITransaction extends TransactionRecord, Document {}

const transactionModel = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default transactionModel;
