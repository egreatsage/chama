    import mongoose, { Schema, models } from "mongoose";
    
    const InvestmentSchema = new Schema({
      chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true },
      title: { type: String, required: true },
      description: { type: String },
      category: { type: String, enum: ['Real Estate', 'Stocks', 'Money Market', 'Business Venture', 'Other'], default: 'Other' },
      initialCost: { type: Number, required: true, default: 0 },
      currentValue: { type: Number, default: 0 },
      status: { type: String, enum: ['active', 'liquidated'], default: 'active' },
      liquidatedAt: { type: Date },
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    }, { timestamps: true });
    
    const Investment = models.Investment || mongoose.model("Investment", InvestmentSchema);
    export default Investment;
    
