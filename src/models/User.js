import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, unique: true, required: true },
  phoneNumber: { type: String, unique: true, required: true },
  password:  { type: String, required: true }, // Hashed with bcrypt
  photoUrl:  { type: String }, // Cloudinary link
  emailVerified: { type: Boolean, default: false }, // From new documentation
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