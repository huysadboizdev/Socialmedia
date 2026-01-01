import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

const missionSchema = new Schema({
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["like", "follow", "comment", "share"],
    required: true
  },
  reward: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

type MissionRecord = InferSchemaType<typeof missionSchema>;
export interface IMission extends MissionRecord, Document {}

const missionModel = mongoose.model<IMission>("mission", missionSchema);
export default missionModel;
