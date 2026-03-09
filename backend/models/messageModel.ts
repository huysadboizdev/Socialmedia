import type { Document, InferSchemaType } from "mongoose";
import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true }, // The user involved in the chat
    sender: { type: String, enum: ['user', 'admin'], required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    replyTo: { type: Schema.Types.ObjectId, ref: 'message', default: null }, // Reference to the message being replied to
  },
  { timestamps: true }
);

type MessageRecord = InferSchemaType<typeof messageSchema>;
export interface IMessage extends MessageRecord, Document {}

const messageModel = mongoose.model<IMessage>("message", messageSchema);
export default messageModel;
