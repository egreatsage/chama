import mongoose, { Schema, models } from "mongoose";

const WithdrawalSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: "Chama", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

const Withdrawal = models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);
export default Withdrawal;