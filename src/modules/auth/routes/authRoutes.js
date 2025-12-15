import express from "express";
import {
  signup,
  login,
  getUser,
} from "../services/authService.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { authenticate } from "../../../middleware/authMiddleware.js";
// import { uploadInterceptor } from "../../../utils/s3/s3.js";
// import { UPLOAD_PATHS } from "../../../utils/s3/uploadPaths.config.js";
const router = express.Router();

// Signup route with validation
router.post(
  "/signup",
//   uploadInterceptor(
//     [
//       {
//         fieldName: "profilePicture",
//         path: UPLOAD_PATHS.USER_PROFILE_PICTURE,
//         isPublic: false,
//         maxCount: 1,
//       },
//     ],
//     {
//       fileSizeMB: 10, // Global 10MB limit
//       maxFiles: 1, // Max 2 files total
//     }
//   ),
  //   validate(registerValidator),
  asyncHandler(signup)
);

// Login route with validation
router.post("/login", asyncHandler(login));

// Get user details route
router.get("/user", authenticate, asyncHandler(getUser));

// Forgot password route
// router.post("/forgot-password", asyncHandler(forgotPassword));
// // Reset password route
// router.post("/reset-password", asyncHandler(resetPassword));

// Edit profile route with validation
// router.patch(
//   "/edit-profile",
//   authenticate,
//   uploadInterceptor(
//     [
//       {
//         fieldName: "profilePicture",
//         path: UPLOAD_PATHS.USER_PROFILE_PICTURE,
//         isPublic: false,
//         maxCount: 1,
//       },
//     ],
//     {
//       fileSizeMB: 10, // Global 10MB limit
//       maxFiles: 1, // Max 2 files total
//     }
//   ),
//   asyncHandler(editProfile)
// );

// Get signed URL for S3 upload
// router.get("/signed-url", authenticate, asyncHandler(getSignedUrl));
export default router;
