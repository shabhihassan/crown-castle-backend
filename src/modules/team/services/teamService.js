import status from "http-status";
import ResponseHandler from "../../../utils/ResponseHandler.js";
import { responseMessages } from "../responses/responseMessages.js";
import Team from "../models/team.js";
import { paginationStage, keywordSearchStage } from "../../../utils/helpers.js";
import { deleteFile } from "../../../utils/s3/s3.js";

/**
 * CREATE – Create new team member (Admin)
 */
export const createTeamMember = async (req, res) => {
  const { name, role, description } = req.body;
  const image = req.files?.images?.[0]?.key;

  try {
    if (!name || !role || !description || !image) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.MISSING_REQUIRED_FIELDS,
        status.BAD_REQUEST
      );
    }

    const teamMember = await Team.create({
      name,
      role,
      description,
      image,
    });

    return ResponseHandler.success(
      res,
      { _id: teamMember._id },
      responseMessages.success.DATA_CREATED,
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
 * GET – Get single team member by ID
 */
export const getTeamMemberById = async (req, res) => {
  const { id } = req.params;

  try {
    const teamMember = await Team.findById(id).lean();

    if (!teamMember) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND
      );
    }

    return ResponseHandler.success(
      res,
      teamMember,
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
 * GET ALL – Get all team members with aggregation, pagination & search
 */
export const getAllTeamMembers = async (req, res) => {
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

    const matchStage = {
      ...(keyword
        ? keywordSearchStage(keyword, ["name", "role", "description"])
        : {}),
    };

    const teamMembers = await Team.aggregate([
      { $match: matchStage },
      {
        $project: {
          _id: 1,
          name: 1,
          role: 1,
          description: 1,
          image: 1,
          createdAt: 1,
        },
      },
      paginationStage({
        page: parseInt(page),
        perPage: parseInt(perPage),
        sort,
      }),
    ]);

    const result = teamMembers?.[0]?.data || [];
    const total = teamMembers?.[0]?.metadata?.[0]?.total || 0;

    return ResponseHandler.success(
      res,
      {
        teamMembers: result,
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

/**
 * UPDATE – Update team member by ID (Admin)
 * Uses findByIdAndUpdate
 */
export const updateTeamMember = async (req, res) => {
  const { id } = req.params;
  const { name, role, description } = req.body;
  const image = req.files?.images?.[0]?.key;

  try {
    const existingTeamMember = await Team.findById(id);

    if (!existingTeamMember) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND
      );
    }

    const updatedTeamMember = await Team.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(role && { role }),
        ...(description && { description }),
        ...(image && { image }),
      },
      { new: true }
    );

    // delete old image only if a new one is uploaded
    if (image && existingTeamMember.image) {
      await deleteFile(existingTeamMember.image);
    }

    return ResponseHandler.success(
      res,
      { _id: updatedTeamMember._id },
      responseMessages.success.DATA_UPDATED,
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
 * DELETE – Delete team member by ID (Admin)
 * Uses findByIdAndDelete
 */
export const deleteTeamMember = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTeamMember = await Team.findByIdAndDelete(id);

    if (!deletedTeamMember) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND
      );
    }

    // delete image from bucket
    if (deletedTeamMember.image) {
      await deleteFile(deletedTeamMember.image);
    }

    return ResponseHandler.success(
      res,
      null,
      responseMessages.success.DATA_DELETED,
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
