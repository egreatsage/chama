// src/models/Vote.js
import mongoose, { Schema, models } from "mongoose";

const VoteSchema = new Schema({
  pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  optionIndex: { type: Number, required: true }
});

// Ensures a user can only vote once per poll
VoteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

const Vote = models.Vote || mongoose.model("Vote", VoteSchema);
export default Vote;
