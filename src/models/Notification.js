import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "warning", "success"], default: "info" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Notification = models.Notification || mongoose.model("Notification", NotificationSchema);
export default Notification;
