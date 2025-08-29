import mongoose, { Schema, models } from "mongoose";

// --- Sub-schemas for different operation types ---

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
  // Simplified for now, can be expanded later
  currentItemDescription: { type: String },
  currentTargetAmount: { type: Number },
  currentBeneficiaryId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });


// --- Main Chama Schema ---

const ChamaSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // --- New Operation Type Field ---
  operationType: {
    type: String,
    enum: ['equal_sharing', 'rotation_payout', 'group_purchase'],
    required: true,
    default: 'equal_sharing' // A safe default
  },

  // --- Basic Financial Config (already exists) ---
  contributionAmount: { type: Number, default: 0 },
  contributionFrequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'quarterly'], 
    default: 'monthly' 
  },

  // --- Type-Specific Configurations ---
  equalSharing: { type: EqualSharingSchema },
  rotationPayout: { type: RotationPayoutSchema },
  groupPurchase: { type: GroupPurchaseSchema },

  // --- Status and Approval (already exists) ---
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'active', 'suspended', 'closed'], 
    default: 'pending' 
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

}, { timestamps: true });

const Chama = models.Chama || mongoose.model("Chama", ChamaSchema);
export default Chama;
