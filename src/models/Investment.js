import mongoose, { Schema, models } from "mongoose";

const InvestmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  expectedReturn: { type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Investment = models.Investment || mongoose.model("Investment", InvestmentSchema);
export default Investment;
