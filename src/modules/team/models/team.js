import mongoose from "mongoose";
import { Collections } from "../../../utils/common/enums/collections.js";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team member name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    role: {
      type: String,
      required: [true, "Team member role is required"],
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Team member description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    image: {
      type: String,
      required: [true, "Team member image is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  Collections.TEAM_MEMBERS,
  TeamSchema
);
