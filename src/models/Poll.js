// src/models/Poll.js
import mongoose, { Schema, models } from "mongoose";

const PollSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true, index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true, trim: true, maxlength: 200 },
  options: [{
    _id: false, // Don't create IDs for subdocuments
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' }
}, { timestamps: true });

const Poll = models.Poll || mongoose.model("Poll", PollSchema);
export default Poll;
