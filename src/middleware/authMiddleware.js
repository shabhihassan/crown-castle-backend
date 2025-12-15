import { verifyToken } from '../utils/jwt.js';
import ResponseHandler from '../utils/ResponseHandler.js';
import { commonResponses } from '../utils/responseMessages.js';
import status from 'http-status';
/* 
 * Middleware to authenticate requests using JWT.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
export const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return ResponseHandler.fail(res, commonResponses.fail.NO_TOKEN_PROVIDED, status.UNAUTHORIZED);
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach the decoded user to the request object
    next();
  } catch (error) {
    ResponseHandler.fail(res, commonResponses.fail.INVALID_TOKEN, status.UNAUTHORIZED);
  }
};