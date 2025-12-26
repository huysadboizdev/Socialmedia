import mongoose from "mongoose";

const missionSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Like bài viết, Follow...
  type: {
    type: String,
    enum: ["like", "follow", "comment", "share"],
    required: true
  },
  reward: { type: Number, required: true }, // số tiền nhận
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("mission", missionSchema);
