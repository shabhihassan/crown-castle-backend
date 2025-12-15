import { commonResponses }  from './responseMessages.js';
import {status as statusCode } from 'http-status';
const ResponseHandler = {
  /* 
   * Send a success response.
   * @param {object} res - The Express response object.
   * @param {object} data - The data to send in the response.
   * @param {string} message - The success message (optional).
   * @param {number} statusCode - The HTTP status code (default: 200).
   */
  success: (res, data, message = commonResponses.success.OPERATION_SUCCESSFUL, status = statusCode.OK) => {
    res.status(status).json({
      success: true,
      status,
      message,
      data,
    });
  },

  /* 
   * Send an error response.
   * @param {object} res - The Express response object.
   * @param {string} message - The error message (optional).
   * @param {number} statusCode - The HTTP status code (default: 400).
   * @param {object} errors - Additional error details (optional).
   */
  fail: (res, message = commonResponses.fail.INTERNAL_SERVER_ERROR, status = statusCode.BAD_REQUEST, errors= {}) => {
    console.error(`Error: ${message}`, errors); // Log the error for debugging
    res.status(status).json({
      success: false,
      status,
      message, 
      ...(Object.keys(errors)?.length && { errors }), // Spread only if errors exist
    });
  },
  
};

export default ResponseHandler;