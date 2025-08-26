import mongoose, { Schema, models } from "mongoose";

const ChamaMemberSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['member', 'treasurer', 'secretary', 'chairperson'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensures a user can only join a specific Chama once
ChamaMemberSchema.index({ chamaId: 1, userId: 1 }, { unique: true });

const ChamaMember = models.ChamaMember || mongoose.model("ChamaMember", ChamaMemberSchema);
export default ChamaMember;