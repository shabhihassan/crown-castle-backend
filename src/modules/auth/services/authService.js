import {
  comparePassword,
} from "../../../utils/helpers.js";
import ResponseHandler from "../../../utils/ResponseHandler.js";
import { responseMessages } from "../responses/responseMessages.js";
import status from "http-status";
import User from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();
import { getPublicUrl } from "../../../utils/s3/s3.js";
import { generateSignedUrl } from "../../../utils/s3/s3.js";
/**
 * Login admin and return token
 */
export const login = async (req, res) => {
  const { emailAddress, password } = req.body;

  try {
    // Validate input
    if (!emailAddress || !password) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.INVALID_CREDENTIALS,
        status.BAD_REQUEST
      );
    }

    // Find admin user with password
    const admin = await User.findOne({
      emailAddress,
    }).select("+password");
    if (!admin || !admin.isActive) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.USER_NOT_FOUND,
        status.UNAUTHORIZED
      );
    }

    // Verify password
    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.INVALID_CREDENTIALS,
        status.UNAUTHORIZED
      );
    }

    // Return admin details and token
    return ResponseHandler.success(
      res,
      {
        user: {
          _id: admin?._id,
          fullName: admin?.fullName,
          emailAddress: admin?.emailAddress,
          profilePhoto: admin?.profilePhoto,
          type: admin?.type,
          // Include any other admin-specific fields
        },
        accessToken: admin.getSignedJwtToken(),
      },
      responseMessages.success.USER_LOGGED_IN,
      status.OK
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR
    );
  }
};
/**
 * Register a new user with OTP verification
 */
export const signup = async (req, res) => {
  const { emailAddress, password, fullName } = req.body;
  // Get files from request
  const profilePhoto = req.files?.profilePicture?.[0]?.key;
  try {
    // Check if email already exists
    const exists = await User.findOne({ emailAddress }).lean();
    if (exists) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DUPLICATE_EMAIL,
        status.BAD_REQUEST
      );
    }

    // Create user
    const user = await User.create({
      fullName,
      emailAddress,
      password,
    });

    return ResponseHandler.success(
      res,
      {
        user: {
          _id: user?._id,
          fullName: user?.fullName,
          emailAddress: user?.emailAddress,
        },
        accessToken: user.getSignedJwtToken(),
      },
      responseMessages.success.USER_REGISTERED,
      status.CREATED
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Get current authenticated user
 */
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req?.user?._id).select("-password");
    if (!user) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.USER_NOT_FOUND,
        status.NOT_FOUND
      );
    }
    return ResponseHandler.success(
      res,
      { user },
      responseMessages.success.USER_DETAILS_FETCHED
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Reset user password
 */
export const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    const user = await User.findByIdAndUpdate(
      user._id,
      { password },
      { new: true }
    );

    if (!user) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.USER_NOT_FOUND,
        status.NOT_FOUND
      );
    }
    return ResponseHandler.success(
      res,
      {},
      responseMessages.success.PASSWORD_UPDATED,
      status.OK
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Edit user profile
 */
export const editProfile = async (req, res) => {
  const userId = req.user._id;
  const profilePhoto = req.files?.profilePicture?.[0]?.key;

  try {
    // Prepare update object
    const updatedDetails = {};
    if (req.body.fullName) updatedDetails.fullName = req.body.fullName;

    // Update user
    const user = await User.findByIdAndUpdate(userId, updatedDetails, {
      new: true,
    }).select("-password");

    if (!user) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.USER_NOT_FOUND,
        status.NOT_FOUND
      );
    }

    return ResponseHandler.success(
      res,
      { user },
      responseMessages.success.PROFILE_UPDATED,
      status.OK
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR
    );
  }
};

/*
 * Get a signed URL for uploading files to S3.
 * @param {object} req - The Express request object containing the file path and type.
 * @param {object} res - The Express response object.
 */

export const getSignedUrl = async (req, res) => {
  const { path, type = ACL.PRIVATE } = req.query;

  if (!path) {
    return ResponseHandler.fail(
      res,
      responseMessages.fail.INVALID_PATH,
      status.BAD_REQUEST
    );
  }

  let url;
  if (type === ACL.PUBLIC) {
    url = getPublicUrl(path);
  } else {
    url = await generateSignedUrl(path);
  }

  return ResponseHandler.success(
    res,
    url,
    responseMessages.success.SIGNED_URL_GENERATED
  );
};

/**
 * Send password reset link to user's email
 */
// export const forgotPassword = async (req, res) => {
//   const { emailAddress } = req.body;

//   try {
//     // Find user
//     const user = await User.findOne({ emailAddress });
//     if (!user) {
//       return ResponseHandler.fail(
//         res,
//         responseMessages.fail.USER_NOT_FOUND,
//         status.NOT_FOUND
//       );
//     }

//     // Generate reset token and expiry (1 hour)
//     const resetPasswordToken = crypto.randomBytes(32).toString("hex");
//     //30 minutes from now
//     const resetTokenExpires = generateOTPExpires(30);

//     // Update user with reset token
//     await User.findByIdAndUpdate(
//       user._id,
//       {
//         resetPasswordToken,
//         resetTokenExpires,
//       },
//       { new: false }
//     );

//     // Create reset URL
//     const resetUrl = `${process.env.FRONTEND_URL}/new-password?token=${resetPasswordToken}`;

//     // Send email with reset link
//     await sendEmail(user.emailAddress, TemplateName.PASSWORD_RESET, {
//       resetUrl,
//     });

//     return ResponseHandler.success(
//       res,
//       {},
//       responseMessages.success.RESET_EMAIL_SENT,
//       status.OK
//     );
//   } catch (error) {
//     return ResponseHandler.fail(
//       res,
//       error.message,
//       status.INTERNAL_SERVER_ERROR
//     );
//   }
// };

// /**
//  * Verify password reset token
//  */
// export const verifyResetToken = async (req, res) => {
//   const { token } = req.body;
//   try {
//     // Find user by reset token
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetTokenExpires: { $gt: Date.now() },
//     });
//     if (!user) {
//       return ResponseHandler.fail(
//         res,
//         responseMessages.fail.INVALID_LINK,
//         status.BAD_REQUEST
//       );
//     }

//     return ResponseHandler.success(
//       res,
//       { emailAddress: user.emailAddress },
//       responseMessages.success.RESET_LINK_VERIFIED,
//       status.OK
//     );
//   } catch (error) {
//     return ResponseHandler.fail(
//       res,
//       error.message,
//       status.INTERNAL_SERVER_ERROR
//     );
//   }
// };
