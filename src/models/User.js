import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, unique: true, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  password:  { type: String, required: true }, 
  photoUrl:  { type: String }, 
  emailVerified: { type: Boolean, default: false }, 
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
}, { timestamps: true });

// Virtual field for fullName
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

const User = models.User || mongoose.model("User", UserSchema);
export default User;