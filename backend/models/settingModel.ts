import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

const settingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

type SettingRecord = InferSchemaType<typeof settingSchema>;
export interface ISetting extends SettingRecord, Document {}

const settingModel = mongoose.model<ISetting>("setting", settingSchema);
export default settingModel;
