import mongoose, { Schema, models } from "mongoose";

const PayoutEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amountReceived: { type: Number, required: true }
}, { _id: false });

const ChamaCycleSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true },
  
  // Identifies what kind of cycle this was
  type: { 
    type: String, 
    enum: ['equal_sharing', 'rotation_payout', 'group_purchase'], 
    required: true 
  },
  
  // General Cycle Information
  cycleNumber: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: Date.now },
  totalAmountDistributed: { type: Number, required: true },
  
  // Specific to Equal Sharing
  payouts: [PayoutEntrySchema],
  
  status: { type: String, enum: ['active', 'completed'], default: 'completed' }

}, { timestamps: true });

// Index for efficient querying
ChamaCycleSchema.index({ chamaId: 1, cycleNumber: 1 }, { unique: true });

const ChamaCycle = models.ChamaCycle || mongoose.model("ChamaCycle", ChamaCycleSchema);
export default ChamaCycle;
