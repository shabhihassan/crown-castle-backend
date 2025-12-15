import mongoose from "mongoose";
import { Collections } from "../../../utils/common/enums/collections.js";
import { generateToken } from "../../../utils/jwt.js";
import { hashPassword, comparePassword } from "../../../utils/helpers.js";
const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    emailAddress: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [8, "Password must be at least 6 characters"],
      maxlength: [40, "Password cannot exceed 40 characters"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long",
      ],
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving - using the helper
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await hashPassword(this.password); // Using the helper
  next();
});
//update password
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    update.password = await hashPassword(update.password); // Using the helper
  }
  next();
});
// Sign JWT and return - using the helper
UserSchema.methods.getSignedJwtToken = function () {
  return generateToken({
    _id: this._id,
    type: this.type,
    emailAddress: this.emailAddress,
  });
};

// Method to compare passwords - using the helper
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await comparePassword(enteredPassword, this.password);
};

export default mongoose.model(Collections.USERS, UserSchema);
