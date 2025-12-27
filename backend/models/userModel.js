import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String },
    balance: { type: Number, default: 0 },
    image: { type: String },
    completedMissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mission' }]
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);
export default userModel;
