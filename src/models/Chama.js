// File Path: src/models/Chama.js
import mongoose, { Schema, models } from "mongoose";

// --- Sub-schemas ---

// NEW: A sub-schema to hold details for the CURRENT active cycle
const EqualSharingCycleSchema = new Schema({
  targetAmount: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
}, { _id: false });

const EqualSharingSchema = new Schema({
  // The current cycle's configuration
  currentCycle: { type: EqualSharingCycleSchema, default: () => ({}) },
  automaticSharing: { type: Boolean, default: false },
}, { _id: false });

const RotationPayoutSchema = new Schema({
  targetAmount: { type: Number, default: 0 },
  rotationOrder: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  currentRecipientIndex: { type: Number, default: 0 },
  nextPayoutDate: { type: Date },
  payoutFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
  // startDate remains relevant for the overall start of the rotation
  savingStartDate: { type: Date, default: Date.now }, 
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
  // NEW: A counter for the number of completed cycles
  cycleCount: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'approved', 'active', 'suspended', 'closed'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },

  // --- Type-Specific Configurations ---
  equalSharing: { type: EqualSharingSchema, default: {} },
  rotationPayout: { type: RotationPayoutSchema, default: {} },

}, { timestamps: true });

// When creating a new Chama, transfer top-level config to the first cycle
ChamaSchema.pre('save', function(next) {
  if (this.isNew) {
    if (this.operationType === 'equal_sharing' && this.get('equalSharing.targetAmount')) {
      this.equalSharing.currentCycle = {
        targetAmount: this.get('equalSharing.targetAmount'),
        startDate: this.get('equalSharing.savingStartDate') || new Date(),
        endDate: this.get('equalSharing.savingEndDate')
      };
      // Clean up the old top-level fields
      this.set('equalSharing.targetAmount', undefined);
      this.set('equalSharing.savingStartDate', undefined);
      this.set('equalSharing.savingEndDate', undefined);
    }
  }
  next();
});


const Chama = models.Chama || mongoose.model("Chama", ChamaSchema);
export default Chama;