import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String },
    password: { 
      type: String, 
      required: function(this: IUser) { return !this.googleId; } 
    },
    googleId: { type: String },
    balance: { type: Number, default: 0 },
    missionBalance: { type: Number, default: 0 },
    isMissionBalanceMigrated: { type: Boolean, default: false },
    image: { type: String },
    isBlocked: { type: Boolean, default: false },
    completedMissions: [{ type: Schema.Types.ObjectId, ref: 'mission' }],
    attendance: {
      lastDate: { type: Date, default: null },
      streak: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

type UserRecord = InferSchemaType<typeof userSchema>;
export interface IUser extends UserRecord, Document {}

const userModel = mongoose.model<IUser>("user", userSchema);
export default userModel;
