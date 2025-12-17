import status from "http-status";
import ResponseHandler from "../../../utils/ResponseHandler.js";
import { responseMessages } from "../responses/responseMessages.js";
import ContactMessages from "../models/contact-message.js";
import { paginationStage, keywordSearchStage } from "../../../utils/helpers.js";
/**
 * CREATE – Submit contact us form
 */
export const createContactMessage = async (req, res) => {
  const { firstName, lastName, emailAddress, message } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !emailAddress || !message) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.MISSING_REQUIRED_FIELDS,
        status.BAD_REQUEST
      );
    }

    const contactMessage = await ContactMessages.create({
      firstName,
      lastName,
      emailAddress,
      message,
    });

    return ResponseHandler.success(
      res,
      { _id: contactMessage._id },
      responseMessages.success.CONTACT_MESSAGE_CREATED,
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
 * GET – Get single contact message by ID (Admin)
 */
export const getContactMessageById = async (req, res) => {
  const { id } = req.params;

  try {
    const contactMessage = await ContactMessages.findById(id).lean();

    if (!contactMessage || !contactMessage.isActive) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND
      );
    }

    return ResponseHandler.success(
      res,
      contactMessage,
      responseMessages.success.DATA_FETCHED,
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
 * GET ALL – Get all contact messages (Admin)
 */
/**
 * GET ALL – Get all contact messages (Admin) with pagination
 */
export const getAllContactMessages = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortField = "createdAt",
      sortOrder = "desc",
      keyword,
    } = req.query;

    const sort = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    // Build match stage dynamically
    const matchStage = {
        ...(keyword ? keywordSearchStage(keyword, ["firstName", "lastName", "emailAddress", "message"]) : {}),
    };

    const contactMessages = await ContactMessages.aggregate([
      { $match: matchStage },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          emailAddress: 1,
          message: 1,
          createdAt: 1,
        },
      },
      paginationStage({
        page: parseInt(page),
        perPage: parseInt(perPage),
        sort,
      }),
    ]);

    const result = contactMessages?.[0]?.data || [];
    const total = contactMessages?.[0]?.metadata?.[0]?.total || 0;

    return ResponseHandler.success(
      res,
      {
        contactMessages: result,
        total,
        page: parseInt(page),
        perPage: parseInt(perPage),
      },
      responseMessages.success.DATA_FETCHED,
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
