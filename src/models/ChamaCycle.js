// File Path: src/models/ChamaCycle.js
import mongoose, { Schema, models } from "mongoose";

const MemberSummarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  totalContributed: { type: Number, required: true },
  weightedScore: { type: Number }, // Represents (Amount * Days_Invested)
  dividendEarned: { type: Number, required: true }, // The calculated profit share
  payoutStatus: { type: String, enum: ['pending', 'paid', 'reinvested'], default: 'pending' }
}, { _id: false });

const ChamaCycleSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true, index: true },
  cycleNumber: { type: Number, required: true },
  cycleType: { type: String, enum: ['equal_sharing', 'rotation_cycle', 'purchase_cycle'], required: true },
  
  // Dates
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }, // The date the cycle was closed

  // Financial Summary
  totalContributions: { type: Number, default: 0 },
  totalInterestGenerated: { type: Number, default: 0 }, // Gross Profit
  totalFines: { type: Number, default: 0 },
  netProfit: { type: Number, default: 0 }, // The amount available for dividends
  
  // Member Details (The Dividend Calculation)
  memberSummaries: [MemberSummarySchema],
  
  distributedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'completed' },
}, { timestamps: true });

const ChamaCycle = models.ChamaCycle || mongoose.model("ChamaCycle", ChamaCycleSchema);
export default ChamaCycle;