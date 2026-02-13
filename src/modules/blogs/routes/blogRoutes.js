import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  generateBlogContent,
  uploadInlineImage,
  getLatestBlogs,
  getBlogBySlug
} from "../services/blogService.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { authenticate } from "../../../middleware/authMiddleware.js";
import { uploadInterceptor } from "../../../utils/s3/s3.js";
import { UPLOAD_PATHS } from "../../../utils/s3/uploadPaths.js";

const router = express.Router();

/**
 * Generate Blog
 */
router.post("/generate", authenticate, asyncHandler(generateBlogContent));
/**
 * Admin – Create blog
 */
router.post(
  "/",
  authenticate,
  uploadInterceptor(
    [
      {
        fieldName: "image",
        path: UPLOAD_PATHS.BLOG_IMAGE,
        isPublic: true,
        maxCount: 1,
      },
    ],
    {
      fileSizeMB: 10,
      maxFiles: 1,
    },
  ),
  asyncHandler(createBlog),
);

router.post(
  "/upload-inline-image",
  authenticate,
  uploadInterceptor(
    [
      {
        fieldName: "image",
        path: UPLOAD_PATHS.BLOG_CONTENT_IMAGES,
        isPublic: true,
        maxCount: 1,
      },
    ],
    {
      fileSizeMB: 10, // Content images can be smaller than featured images
      maxFiles: 1,
    },
  ),
  asyncHandler(uploadInlineImage),
);
/**
 * Public – Get all blogs
 */
router.get("/", authenticate, asyncHandler(getAllBlogs));

router.get("/public", asyncHandler(getAllBlogs));

router.get("/latest", asyncHandler(getLatestBlogs));

/**
 * Public – Get single blog by slug
 */
router.get("/slug/:slug", asyncHandler(getBlogBySlug));

/**
 * Public – Get single blog by ID
 */
router.get("/:id", authenticate, asyncHandler(getBlogById));

/**
 * Admin – Update blog
 */
router.patch(
  "/:id",
  authenticate,
  uploadInterceptor(
    [
      {
        fieldName: "image",
        path: UPLOAD_PATHS.BLOG_IMAGE,
        isPublic: true,
        maxCount: 1,
      },
    ],
    {
      fileSizeMB: 5,
      maxFiles: 1,
    },
  ),
  asyncHandler(updateBlog),
);

/**
 * Admin – Delete blog
 */
router.delete("/:id", authenticate, asyncHandler(deleteBlog));

export default router;
