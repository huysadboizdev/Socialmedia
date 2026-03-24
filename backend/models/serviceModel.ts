import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

const serviceSchema = new Schema({
    name: {
      type: String,
      required: true, 
      trim: true
    },
    platform: {
      type: String,
      required: true,
      enum: ["Facebook", "Instagram", "TikTok", "YouTube", "Locket", "Spotify", "Apple"]
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    speed: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isMaintenance: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

type ServiceRecord = InferSchemaType<typeof serviceSchema>;
export interface IService extends ServiceRecord, Document {}

const serviceModel = mongoose.model<IService>("Service", serviceSchema); 
export default serviceModel;
