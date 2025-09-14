// File Path: src/models/Contribution.js
import mongoose from "mongoose";

const ContributionSchema = new mongoose.Schema({
  chamaId: { type: mongoose.Schema.Types.ObjectId, ref: "Chama", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "failed"], default: "pending" },
  paymentMethod: { type: String, enum: ["mpesa", "cash", "bank_transfer"], default: "mpesa" },
  cycle: { type: Number, required: true },

  // M-Pesa specific fields
  // FIX: The `sparse: true` option allows multiple documents to have a null value for this field.
  // This is essential for allowing multiple manual "cash" entries.
  checkoutRequestId: { type: String, unique: true, sparse: true }, 
  mpesaReceiptNumber: { type: String },
  transactionDate: { type: String },
  phoneNumber: { type: String },
  failureReason: { type: String },

  // Field for admin-added notes
  notes: { type: String }

}, { timestamps: true });

export default mongoose.models.Contribution || mongoose.model("Contribution", ContributionSchema);