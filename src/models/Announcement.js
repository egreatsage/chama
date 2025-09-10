// src/models/Announcement.js
import mongoose, { Schema, models } from "mongoose";

const AnnouncementSchema = new Schema({
  chamaId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chama', 
    required: true, 
    index: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 150
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 2000
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Announcement = models.Announcement || mongoose.model("Announcement", AnnouncementSchema);
export default Announcement;