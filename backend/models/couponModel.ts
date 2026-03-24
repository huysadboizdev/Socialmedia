import { Schema, model, type Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountPercent: number; // e.g., 10 for 10%
  discountAmount: number; // fixed amount if percent is 0
  totalQuantity: number;
  usedQuantity: number;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalQuantity: { type: Number, required: true },
  usedQuantity: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Index for faster lookups
couponSchema.index({ expiryDate: 1 });

const couponModel = model<ICoupon>('Coupon', couponSchema);

export default couponModel;
