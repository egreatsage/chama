import mongoose, { Schema, models } from "mongoose";

const InvoiceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contributionId: {
    type: Schema.Types.ObjectId,
    ref: "Contribution",
    required: true,
    unique: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["paid", "due", "overdue"],
    default: "paid",
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Invoice = models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export default Invoice;