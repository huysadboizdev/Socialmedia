import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

export type OrderStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Cancelled"],
    default: "Pending"
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
});

type OrderRecord = InferSchemaType<typeof orderSchema>;
export interface IOrder extends OrderRecord, Document {
  status: OrderStatus;
}

const orderModel = mongoose.model<IOrder>("Order", orderSchema);
export default orderModel;
