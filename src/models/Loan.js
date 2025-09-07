// File Path: src/models/Loan.js
import mongoose, { Schema, models } from "mongoose";

const RepaymentSchema = new Schema({
    repaidAmount: { type: Number },
    repaidDate: { type: Date },
}, { _id: false });

const LoanSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'repaid'], 
    default: 'pending' 
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String, trim: true },
  repaymentDetails: { type: RepaymentSchema, default: {} }
}, { timestamps: true });

const Loan = models.Loan || mongoose.model("Loan", LoanSchema);
export default Loan;

