import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../services/projectService.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { authenticate } from "../../../middleware/authMiddleware.js";
import { uploadInterceptor } from "../../../utils/s3/s3.js";
import { UPLOAD_PATHS } from "../../../utils/s3/uploadPaths.js";
const router = express.Router();

/**
 * Admin – Create project
 */
router.post(
  "/",
  authenticate,
  uploadInterceptor(
    [
      {
        fieldName: "images",
        path: UPLOAD_PATHS.PROJECT_IMAGE,
        isPublic: true,
        maxCount: 1, 
      },
    ],
    {
      fileSizeMB: 5, 
      maxFiles: 1, 
    }
  ),
  asyncHandler(createProject)
);

/**
 * Public – Get all projects
 */
router.get(
  "/",
  asyncHandler(getAllProjects)
);

/**
 * Public – Get single project by ID
 */
router.get(
  "/:id",
  asyncHandler(getProjectById)
);

/**
 * Admin – Update project
 */
router.patch(
  "/:id",
  authenticate,
  uploadInterceptor(
    [
      {
        fieldName: "images",
        path: UPLOAD_PATHS.PROJECT_IMAGE,
        isPublic: true,
        maxCount: 1, 
      },
    ],
    {
      fileSizeMB: 5, 
      maxFiles: 1, 
    }
  ),
  asyncHandler(updateProject)
);

/**
 * Admin – Delete project
 */
router.delete(
  "/:id",
  authenticate,
  asyncHandler(deleteProject)
);

export default router;
