import express from "express";
import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageById,
} from "../services/contactService.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { authenticate } from "../../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Public – Contact Us form submission
 */
router.post(
  "/",
  asyncHandler(createContactMessage)
);

/**
 * Admin – Get all contact messages
 */
router.get(
  "/",
  authenticate,
  asyncHandler(getAllContactMessages)
);

/**
 * Admin – Get single contact message by ID
 */
router.get(
  "/:id",
  authenticate,
  asyncHandler(getContactMessageById)
);

export default router;
