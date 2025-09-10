    import mongoose, { Schema, models } from "mongoose";
    
    const FinancialTransactionSchema = new Schema({
      chamaId: { type: Schema.Types.ObjectId, ref: 'Chama', required: true },
      // Link to an investment if it's an investment-related transaction
      investmentId: { type: Schema.Types.ObjectId, ref: 'Investment', sparse: true }, 
      type: { type: String, enum: ['income', 'expense'], required: true },
      category: { type: String, required: true }, // e.g., 'Investment Purchase', 'Dividend', 'Land Sale', 'Bank Fees'
      amount: { type: Number, required: true },
      description: { type: String },
      recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    }, { timestamps: true });
    
    const FinancialTransaction = models.FinancialTransaction || mongoose.model("FinancialTransaction", FinancialTransactionSchema);
    export default FinancialTransaction;
    
