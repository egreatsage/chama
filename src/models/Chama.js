import mongoose, { Schema, models } from "mongoose";

const ChamaSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Financial Configuration from documentation
  contributionAmount: { type: Number, default: 0 },
  contributionFrequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly', 'quarterly'], 
    default: 'monthly' 
  },
  
  // Settings from documentation
  membershipLimit: { type: Number, default: 0 }, // 0 for no limit
  joinApprovalRequired: { type: Boolean, default: true },
  
  // Status and Approval from documentation
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'active', 'suspended', 'closed'], 
    default: 'pending' 
  },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // System admin who approved
  approvedAt: { type: Date },

}, { timestamps: true });

const Chama = models.Chama || mongoose.model("Chama", ChamaSchema);
export default Chama;