// File Path: src/models/ChamaCycle.js
import mongoose, { Schema, models } from "mongoose";

const PayoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const ChamaCycleSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true, index: true },
  cycleType: { type: String, enum: ['equal_sharing', 'rotation_cycle', 'purchase_cycle'], required: true },
  
  // Fields for Equal Sharing
  targetAmount: { type: Number },
  totalCollected: { type: Number },
  payouts: [PayoutSchema],
  distributedBy: { type: Schema.Types.ObjectId, ref: 'User' },

  // Fields for Rotation & Purchase
  cycleNumber: { type: Number },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User' }, 
  beneficiaryId: { type: Schema.Types.ObjectId, ref: 'User' },
  expectedAmount: { type: Number },
  actualAmount: { type: Number },
  
  
  // Common Fields
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'completed' },
}, { timestamps: true });

const ChamaCycle = models.ChamaCycle || mongoose.model("ChamaCycle", ChamaCycleSchema);
export default ChamaCycle;

