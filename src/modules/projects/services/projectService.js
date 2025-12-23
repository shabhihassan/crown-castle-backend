import status from "http-status";
import ResponseHandler from "../../../utils/ResponseHandler.js";
import { responseMessages } from "../responses/responseMessages.js";
import Projects from "../models/project.js";
import { paginationStage, keywordSearchStage } from "../../../utils/helpers.js";
import { deleteFile } from "../../../utils/s3/s3.js";

/**
 * CREATE – Create new project (Admin)
 */
export const createProject = async (req, res) => {
  const { title, description } = req.body;
  const image = req.files?.images?.[0]?.key;
  try {
    if (!title || !description || !image) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.MISSING_REQUIRED_FIELDS,
        status.BAD_REQUEST
      );
    }

    const project = await Projects.create({
      title,
      description,
      image,
    });

    return ResponseHandler.success(
      res,
      { _id: project._id },
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
 * GET – Get single project by ID
 */
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Projects.findById(id).lean();

    if (!project) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND
      );
    }

    return ResponseHandler.success(
      res,
      project,
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
 * GET ALL – Get all projects with pagination & search
 */
export const getAllProjects = async (req, res) => {
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
        ? keywordSearchStage(keyword, ["title", "description"])
        : {}),
    };

    const projects = await Projects.aggregate([
      { $match: matchStage },
      {
        $project: {
          _id: 1,
          title: 1,
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

    const result = projects?.[0]?.data || [];
    const total = projects?.[0]?.metadata?.[0]?.total || 0;

    return ResponseHandler.success(
      res,
      {
        projects: result,
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
 * UPDATE – Update project by ID (Admin)
 */
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const image = req.files?.images?.[0]?.key;

  try {
    const project = await Projects.findById(id);

    if (!project) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND
      );
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (image) project.image = image;

    await project.save();
    //delete file from bucket
    await deleteFile(project.image)
    return ResponseHandler.success(
      res,
      { _id: project._id },
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
 * DELETE – Delete project by ID (Admin)
 */
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Projects.findById(id);

    if (!project) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND
      );
    }

    await project.deleteOne();
    //delete file from bucket
    await deleteFile(project.image)
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
