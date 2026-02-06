import mongoose from "mongoose";
import { Collections } from "../../../utils/common/enums/collections.js";

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [150, "Project title cannot exceed 150 characters"],
    },

    tagline: {
      type: String,
      required: [true, "Tag line is required"],
      trim: true,
      maxlength: [1000, "Tag line cannot exceed 1000 characters"],
    },

    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
      maxlength: [2000, "Project description cannot exceed 2000 characters"],
    },

    image: {
      type: String,
      required: [true, "Project image is required"],
      trim: true,
      // optional: basic URL validation
    //   match: [
    //     /^(https?:\/\/.*\.(?:png|jpg|jpeg|webp|svg))$/i,
    //     "Please provide a valid image URL",
    //   ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  Collections.PROJECTS,
  ProjectSchema
);
