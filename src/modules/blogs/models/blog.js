import mongoose from "mongoose";
import { Collections } from "../../../utils/common/enums/collections.js";
import { BLOG_STATUS } from "../../../utils/common/enums/blog-status.js";
const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: 200,
    },

    // slug: {
    //   type: String,
    //   // required: [true, "Blog slug is required"],
    //   trim: true,
    //   lowercase: true,
    //   unique: true,
    //   index: true,
    // },

    excerpt: {
      type: String,
      // required: [true, "Blog excerpt is required"],
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: [true, "Blog content is required"],
      trim: true,
    },

    featuredImage: {
      type: String,
      // required: [true, "Featured image is required"],
      trim: true,
    },

    /* ---------- SEO ---------- */
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    metaKeywords: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: BLOG_STATUS,
      default: BLOG_STATUS.DRAFT,
      index: true,
    },

    publishedAt: {
      type: Date,
    },

    author: {
      type: String,
      trim: true,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search
BlogSchema.index({ title: "text", excerpt: "text", content: "text" });

export default mongoose.model(Collections.BLOGS, BlogSchema);
