// File Path: src/models/Chama.js
import mongoose, { Schema, models } from "mongoose";

// --- Sub-schemas ---


const EqualSharingSchema = new Schema({
  targetAmount: { type: Number, default: 0 },
  savingStartDate: { type: Date, default: Date.now },
  savingEndDate: { type: Date },
  automaticSharing: { type: Boolean, default: false },
}, { _id: false });

const RotationPayoutSchema = new Schema({
  targetAmount: { type: Number, default: 0 },
  rotationOrder: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  currentRecipientIndex: { type: Number, default: 0 },
  nextPayoutDate: { type: Date },
  payoutFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
  savingStartDate: { type: Date, default: Date.now }, // New field
}, { _id: false });




// --- Main Chama Schema ---
const ChamaSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  operationType: {
    type: String,
    enum: ['equal_sharing', 'rotation_payout'],
    required: true,
  },
  contributionFrequency: { type: String, default: 'monthly' },
  currentBalance: { type: Number, default: 0 },
  totalContributions: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'active', 'suspended', 'closed'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  // --- Type-Specific Configurations ---
  equalSharing: { type: EqualSharingSchema, default: {} },
  rotationPayout: { type: RotationPayoutSchema, default: {} },

}, { timestamps: true });

const Chama = models.Chama || mongoose.model("Chama", ChamaSchema);
export default Chama;

