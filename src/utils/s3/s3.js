import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import { ACL } from "../common/enums/acl.js";
import { DEFAULT_UPLOAD_OPTIONS } from "./uploadPaths.js";
import dotenv from "dotenv";
dotenv.config();

// Create S3 client
const s3Client = new S3Client({
  forcePathStyle: false,
  region: process.env.DO_REIGON,
  endpoint: process.env.DO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DO_ACCESS_KEY,
    secretAccessKey: process.env.DO_SECRET_KEY,
  },
});
// Allowed file types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// File filter
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only ${ALLOWED_MIME_TYPES.join(", ")} are allowed`
      ),
      false
    );
  }
};

/**
 * Enhanced upload interceptor that handles multiple fields
 * @param {Array} fieldsConfig - Array of field configurations
 * @param {Object} options - Global options
 */
export const uploadInterceptor = (fieldsConfig, options = {}) => {
  // Create storage configuration
  const storage = multerS3({
    s3: s3Client,
    bucket: process.env.DO_SPACE_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: ACL.PUBLIC_READ,
    metadata: (req, file, cb) => cb(null, { originalName: file.originalname }),
    key: (req, file, cb) => {
      // Find the field config for this file
      const fieldConfig =
        fieldsConfig.find((f) => f.fieldName === file.fieldname) || {};

      const isPublic =
        fieldConfig.isPublic ??
        options.isPublic ??
        DEFAULT_UPLOAD_OPTIONS.isPublic;
      const path = fieldConfig.path ?? options.path ?? "uploads";

      const folder = isPublic ? ACL.PUBLIC : ACL.PRIVATE;
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${folder}/${path}/${uniqueSuffix}-${file.originalname}`;
      cb(null, filename);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize:
        (options.fileSizeMB ?? DEFAULT_UPLOAD_OPTIONS.fileSizeMB) * 1024 * 1024,
      files: options.maxFiles ?? DEFAULT_UPLOAD_OPTIONS.maxFiles, // Global files limit
    },
  });

  // Convert fieldsConfig to multer fields format
  const multerFields = fieldsConfig.map((field) => ({
    name: field.fieldName,
    maxCount: field.maxCount ?? DEFAULT_UPLOAD_OPTIONS.maxCount,
  }));

  return upload.fields(multerFields);
};

/**
 * Generate signed URL for private files
 * @param {string} path - The full S3 path (e.g., 'private/users/profile-pictures/filename.jpg')
 * @param {number} expiresIn - URL expiry in seconds (default: 1 hour)
 */
export const generateSignedUrl = async (key, expiresIn = 3600) => {
  if (!key) throw new Error("Key is required");

  const command = new GetObjectCommand({
    Bucket: process.env.DO_SPACE_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Get public URL (for public files)
 * @param {string} path - The full S3 path
 */
export const getPublicUrl = (key) => {
  if (!key) return null;

  return `https://${process.env.DO_SPACE_NAME}.${process.env.DO_REGION}.digitaloceanspaces.com/${key}`;
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 */
export const deleteFile = async (key) => {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.DO_SPACE_NAME,
    Key: key,
  });

  await s3Client.send(command);
};
