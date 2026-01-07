import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  missionId: { type: Schema.Types.ObjectId, ref: 'mission', required: true },
  imageProof: { type: String }, // Optional at 'accepted' stage
  status: { 
    type: String, 
    enum: ['accepted', 'pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminNote: { type: String }
}, { timestamps: true });

// Ensure unique submission per mission per user (can change if re-submission allowed after rejection)
submissionSchema.index({ userId: 1, missionId: 1 }, { unique: true });

type SubmissionRecord = InferSchemaType<typeof submissionSchema>;
export interface ISubmission extends SubmissionRecord, Document {}

const submissionModel = mongoose.model<ISubmission>("submission", submissionSchema);
export default submissionModel;
