// File Path: src/models/ChamaCycle.js
import mongoose, { Schema, models } from "mongoose";

const PayoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const ChamaCycleSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true, index: true },
  cycleType: { type: String, enum: ['equal_sharing'], default: 'equal_sharing' },
  
  // For Equal Sharing
  targetAmount: { type: Number, required: true },
  totalCollected: { type: Number, required: true },
  payouts: [PayoutSchema],
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: Date.now },
  distributedBy: { type: Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

const ChamaCycle = models.ChamaCycle || mongoose.model("ChamaCycle", ChamaCycleSchema);
export default ChamaCycle;

