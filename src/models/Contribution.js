import mongoose from "mongoose";

const ContributionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "mpesa",
    },
    checkoutRequestId: {
      type: String,
      required: true,
      unique: true,
    },
    mpesaReceiptNumber: {
      type: String,
      default: null,
    },
    transactionDate: {
      type: String, // Safaricom sends YYYYMMDDHHMMSS
      default: null,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
    ResultCode: {
      type: Number,
      default: null,
    },
    ResultDesc: {
      type: String,
      default: null,
    },
    
  },
  { timestamps: true }
);

export default mongoose.models.Contribution ||
  mongoose.model("Contribution", ContributionSchema);
