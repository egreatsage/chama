// File Path: src/models/Chama.js
import mongoose, { Schema, models } from "mongoose";

// --- Sub-schemas ---
const PurchaseGoalSchema = new Schema({
    // FIX: Added `ref: 'User'` to allow Mongoose to populate this field
    beneficiaryId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemDescription: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'completed', 'queued'], default: 'queued' },
    purchaseOrder: { type: Number }
});

const EqualSharingSchema = new Schema({
  targetAmount: { type: Number, default: 0 },
  savingEndDate: { type: Date },
  automaticSharing: { type: Boolean, default: false },
}, { _id: false });

const RotationPayoutSchema = new Schema({
  payoutAmount: { type: Number, default: 0 },
  rotationOrder: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  currentRecipientIndex: { type: Number, default: 0 },
  nextPayoutDate: { type: Date },
  payoutFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
}, { _id: false });


const GroupPurchaseSchema = new Schema({
  purchaseGoals: [PurchaseGoalSchema],
  currentGoalId: { type: Schema.Types.ObjectId },
  queueType: { type: String, enum: ['sequential', 'random'], default: 'sequential' },
}, { _id: false });

// --- Main Chama Schema ---
const ChamaSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  operationType: {
    type: String,
    enum: ['equal_sharing', 'rotation_payout', 'group_purchase'],
    required: true,
  },
  contributionAmount: { type: Number, default: 0 },
  contributionFrequency: { type: String, default: 'monthly' },
  currentBalance: { type: Number, default: 0 },
  totalContributions: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'active', 'suspended', 'closed'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  // --- Type-Specific Configurations ---
  equalSharing: { type: EqualSharingSchema, default: {} },
  rotationPayout: { type: RotationPayoutSchema, default: {} },
  // FIX: Added a default empty object to prevent the TypeError
  groupPurchase: { type: GroupPurchaseSchema, default: () => ({ purchaseGoals: [] }) },

}, { timestamps: true });

const Chama = models.Chama || mongoose.model("Chama", ChamaSchema);
export default Chama;

