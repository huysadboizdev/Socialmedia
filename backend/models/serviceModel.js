import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
     name: {
      type: String,
      required: true, 
      trim: true
    },

    platform: {
      type: String,
      required: true,
      enum: ["Facebook", "Instagram", "TikTok"]
    },

    type: {
      type: String,
      required: true,
      enum: ["Follow", "Like", "Share", "Comment","Meta Verification Facebook","Meta Verification Instagram"]
    },

    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },

    description: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const serviceModel = mongoose.model.service || mongoose.model("Service", serviceSchema); 

export default serviceModel