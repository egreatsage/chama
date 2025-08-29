import mongoose, { Schema, models } from "mongoose";

const LatePenaltySchema = new Schema({
    enabled: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    gracePeriodDays: { type: Number, default: 0 },
}, { _id: false });

const MeetingAttendanceSchema = new Schema({
    required: { type: Boolean, default: false },
    penaltyAmount: { type: Number, default: 0 },
}, { _id: false });


const ChamaRulesSchema = new Schema({
  chamaId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chama', 
    required: true, 
    unique: true 
  },
  
  latePenalty: { type: LatePenaltySchema, default: () => ({}) },
  meetingAttendance: { type: MeetingAttendanceSchema, default: () => ({}) },
  
  customRules: [{ type: String }], // For free-text rules

}, { timestamps: true });

const ChamaRules = models.ChamaRules || mongoose.model("ChamaRules", ChamaRulesSchema);
export default ChamaRules;
