import mongoose, { Schema, models } from "mongoose";

const TransactionSchema = new Schema({
  type: { type: String, enum: ["contribution", "withdrawal"], required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true }, // link to Contribution/Withdrawal
  amount: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Transaction = models.Transaction || mongoose.model("Transaction", TransactionSchema);
export default Transaction;
