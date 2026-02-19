import mongoose, { Schema, models } from "mongoose";

const LoanSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true }, // Principal amount given to user
  reason: { type: String, required: true, trim: true },
  
  // --- NEW: Loan Terms & Tracking ---
  interestRate: { type: Number, default: 0 }, // e.g., 10 for 10%
  expectedRepaymentDate: { type: Date, required: true }, // Deadline
  totalExpectedRepayment: { type: Number, required: true }, // Principal + Interest
  totalPaid: { type: Number, default: 0 }, // Running total of installments
  penaltyAmount: { type: Number, default: 0 }, // Accumulated late fees
  // ----------------------------------

  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'active', 'defaulted', 'repaid'], 
    default: 'pending' 
  },
  guarantors: [/* existing schema */], 
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String, trim: true },
}, { timestamps: true });

// Virtual to calculate outstanding balance
LoanSchema.virtual('outstandingBalance').get(function() {
  return (this.totalExpectedRepayment + this.penaltyAmount) - this.totalPaid;
});

LoanSchema.set("toJSON", { virtuals: true });
LoanSchema.set("toObject", { virtuals: true });

const Loan = models.Loan || mongoose.model("Loan", LoanSchema);
export default Loan;