// File Path: src/models/Loan.js
import mongoose, { Schema, models } from "mongoose";

const LoanSchema = new Schema({
  chamaId: {
    type: Schema.Types.ObjectId,
    ref: 'Chama',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'repaid'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },
  repaymentDetails: {
    dueDate: Date,
    repaidAmount: { type: Number, default: 0 },
    repaidDate: Date
  }
}, { timestamps: true });

const Loan = models.Loan || mongoose.model("Loan", LoanSchema);
export default Loan;
