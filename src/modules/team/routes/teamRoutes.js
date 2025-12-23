import express from "express";
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from "../services/teamService.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { authenticate } from "../../../middleware/authMiddleware.js";
import { uploadInterceptor } from "../../../utils/s3/s3.js";
import { UPLOAD_PATHS } from "../../../utils/s3/uploadPaths.js";

const router = express.Router();

/**
 * Admin – Create team member
 */
router.post(
  "/",
  authenticate,
  uploadInterceptor(
    [
      {
        fieldName: "images",
        path: UPLOAD_PATHS.TEAM_IMAGE,
        isPublic: true,
        maxCount: 1,
      },
    ],
    {
      fileSizeMB: 5,
      maxFiles: 1,
    }
  ),
  asyncHandler(createTeamMember)
);

/**
 * Public – Get all team members
 */
router.get("/", asyncHandler(getAllTeamMembers));

/**
 * Public – Get single team member by ID
 */
router.get("/:id", asyncHandler(getTeamMemberById));

/**
 * Admin – Update team member
 */
router.patch(
  "/:id",
  authenticate,
  uploadInterceptor(
    [
      {
        fieldName: "images",
        path: UPLOAD_PATHS.TEAM_IMAGE,
        isPublic: true,
        maxCount: 1,
      },
    ],
    {
      fileSizeMB: 5,
      maxFiles: 1,
    }
  ),
  asyncHandler(updateTeamMember)
);

/**
 * Admin – Delete team member
 */
router.delete("/:id", authenticate, asyncHandler(deleteTeamMember));

export default router;
