import mongoose, { Schema, models } from "mongoose";

const MessageSchema = new Schema({
  chamaId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chama', 
    required: true, 
    index: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000 // Limit message length
  },
}, { timestamps: true });

const Message = models.Message || mongoose.model("Message", MessageSchema);
export default Message;
