import mongoose, { Schema, models } from "mongoose";

const AuditLogSchema = new Schema({
  chamaId: { type: Schema.Types.ObjectId, ref: 'Chama' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number },
  description: { type: String },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
}, { timestamps: true });

const AuditLog = models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;