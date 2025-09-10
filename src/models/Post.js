// src/models/Post.js
import mongoose, { Schema, models } from "mongoose";

const PostSchema = new Schema({
  chamaId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Chama', 
    required: true, 
    index: true 
  },
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 5000 
  },
  category: { 
    type: String, 
    enum: ['Success Story', 'Investment Update', 'General News'], 
    default: 'General News' 
  },
  imageUrl: { 
    type: String 
  } // Optional image from Cloudinary
}, { timestamps: true });

const Post = models.Post || mongoose.model("Post", PostSchema);
export default Post;
