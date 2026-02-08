import { Schema, model, type Document, type InferSchemaType } from "mongoose";

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["info", "success", "warning", "error", "admin_message"],
        default: "info"
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

type NotificationRecord = InferSchemaType<typeof notificationSchema>;
export interface INotification extends NotificationRecord, Document {}

const notificationModel = model<INotification>("Notification", notificationSchema);
export default notificationModel;
