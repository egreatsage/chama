// src/models/ContactMessage.js
import mongoose, { Schema, models } from "mongoose";

const ContactMessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

const ContactMessage = models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);
export default ContactMessage;