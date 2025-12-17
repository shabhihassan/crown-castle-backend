import mongoose from "mongoose";
import { Collections } from "../../../utils/common/enums/collections.js";

const ContactMessagesSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    emailAddress: {
      type: String,
      required: [true, "Email address is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  Collections.CONTACT_MESSAGES,
  ContactMessagesSchema
);
