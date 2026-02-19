import mongoose, { Schema, models } from "mongoose";

const TransactionSchema = new Schema({
  type: { 
    type: String, 
    enum: ["contribution", "withdrawal", "loan_repayment", "penalty_payment"], 
    required: true 
  },
  // Links to Loan ID if loan_repayment, or another relevant model
  referenceId: { type: Schema.Types.ObjectId, required: true, index: true }, 
  amount: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  chamaId: { type: Schema.Types.ObjectId, ref: "Chama", index: true },
  paymentMethod: { type: String, enum: ['mpesa', 'cash', 'bank'], default: 'mpesa' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },

  // --- Fields for M-Pesa Tracking ---
  checkoutRequestId: { type: String, index: true, unique: true, sparse: true },
  mpesaReceiptNumber: { type: String },
  transactionDate: { type: Date },
  phoneNumber: { type: String },
  failureReason: { type: String },
  // ------------------------------------

}, { timestamps: true });

const Transaction = models.Transaction || mongoose.model("Transaction", TransactionSchema);
export default Transaction;