import status from "http-status";
import ResponseHandler from "../../../utils/ResponseHandler.js";
import { responseMessages } from "../responses/responseMessages.js";
import Blogs from "../models/blog.js";
import { paginationStage, keywordSearchStage } from "../../../utils/helpers.js";
import { deleteFile } from "../../../utils/s3/s3.js";
import { BLOG_STATUS } from "../../../utils/common/enums/blog-status.js";
import { createModelInstance } from "./../../../utils/llm/config.js";
import { UAE_REAL_ESTATE_PRESET } from "./../../../utils/llm/presets.js";
import { getBlogPrompt } from "./../../../utils/llm/prompts.js";

const aiWriter = createModelInstance(UAE_REAL_ESTATE_PRESET);
/**
 * CREATE – Create new blog (Admin)
 */
export const createBlog = async (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    metaTitle,
    metaDescription,
    metaKeywords,
    tags,
    category,
    status: blogStatus,
    author,
  } = req.body;

  const featuredImage = req.files?.image?.[0]?.key;

  try {
    // if (!title || !slug || !excerpt || !content || !featuredImage) {
    //   return ResponseHandler.fail(
    //     res,
    //     responseMessages.fail.MISSING_REQUIRED_FIELDS,
    //     status.BAD_REQUEST
    //   );
    // }

    const blog = await Blogs.create({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      metaTitle,
      metaDescription,
      metaKeywords,
      tags,
      category,
      status: blogStatus || BLOG_STATUS.DRAFT,
      author,
      publishedAt: blogStatus === BLOG_STATUS.LIVE ? new Date() : null,
    });

    return ResponseHandler.success(
      res,
      { _id: blog._id },
      responseMessages.success.DATA_CREATED,
      status.CREATED,
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * GET – Get single blog by ID
 */
export const getBlogById = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blogs.findById(id).lean();

    if (!blog) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND,
      );
    }

    return ResponseHandler.success(
      res,
      blog,
      responseMessages.success.DATA_FETCHED,
      status.OK,
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * GET ALL – Get all blogs with pagination & search
 */
export const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortField = "publishedAt",
      sortOrder = "desc",
      keyword,
      status: blogStatus,
    } = req.query;

    const sort = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };
    console.log("re.user", req);
    const matchStage = {
      // If user is NOT authenticated → only show LIVE blogs
      ...(!req.user?._id ? { status: BLOG_STATUS.LIVE } : {}),

      // If admin/authenticated user passes status explicitly → allow it
      ...(req.user?._id && blogStatus ? { status: blogStatus } : {}),

      ...(keyword
        ? keywordSearchStage(keyword, ["title", "excerpt", "content"])
        : {}),
    };
    console.log("match stage", matchStage);
    const blogs = await Blogs.aggregate([
      { $match: matchStage },
      {
        $project: {
          title: 1,
          status: 1,
          slug: 1,
          excerpt: 1,
          featuredImage: 1,
          status: 1,
          publishedAt: 1,
          createdAt: 1,
        },
      },
      paginationStage({
        page: parseInt(page),
        perPage: parseInt(perPage),
        sort,
      }),
    ]);

    const result = blogs?.[0]?.data || [];
    const total = blogs?.[0]?.metadata?.[0]?.total || 0;

    return ResponseHandler.success(
      res,
      { blogs: result, total, page: +page, perPage: +perPage },
      responseMessages.success.DATA_FETCHED,
      status.OK,
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * UPDATE – Update blog by ID (Admin)
 */
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const newImage = req.files?.image?.[0]?.key;

  try {
    const blog = await Blogs.findById(id);

    if (!blog) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND,
      );
    }

    const oldImage = blog.featuredImage;

    Object.keys(req.body).forEach((key) => {
      blog[key] = req.body[key];
    });

    if (newImage) blog.featuredImage = newImage;

    if (req.body.status === BLOG_STATUS.LIVE && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    if (newImage && oldImage) {
      await deleteFile(oldImage);
    }

    return ResponseHandler.success(
      res,
      { _id: blog._id },
      responseMessages.success.DATA_UPDATED,
      status.OK,
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR,
    );
  }
};

/**
 * DELETE – Delete blog by ID (Admin)
 */
export const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blogs.findById(id);

    if (!blog) {
      return ResponseHandler.fail(
        res,
        responseMessages.fail.DATA_NOT_FOUND,
        status.NOT_FOUND,
      );
    }

    await blog.deleteOne();

    if (blog.featuredImage) {
      await deleteFile(blog.featuredImage);
    }

    return ResponseHandler.success(
      res,
      null,
      responseMessages.success.DATA_DELETED,
      status.OK,
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR,
    );
  }
};

export const generateBlogContent = async (req, res) => {
  const { keywords, description } = req.body;
  try {
    const finalPrompt = getBlogPrompt({
      keywords,
      description,
      location: "Dubai", 
    });
    const result = await aiWriter.generateContent(finalPrompt);

    // 1. Extract the JSON content (The AI result text)
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    const data = JSON.parse(rawText);

    // 2. Extract Grounding Metadata (Citations)
    const grounding = result.candidates[0].groundingMetadata;
    // const sources =
    //   grounding?.groundingChunks?.map((chunk) => ({
    //     title: chunk.web?.title || "Search Reference",
    //     url: chunk.web?.uri,
    //   })) || [];

    // 3. Send structured response back to Next.js
    return ResponseHandler.success(
      res,
      {
        data,
      },
      responseMessages.success.CONTENT_GENERATED,
      200,
    );
  } catch (error) {
    return ResponseHandler.fail(res, responseMessages.fail.SOMETHING_WENT_WRONG, status.INTERNAL_SERVER_ERROR);
  }
};

// controllers/blog.controller.js

export const uploadInlineImage = async (req, res) => {
  try {
    // Check if file exists in the interceptor's output
    const file = req.files?.image?.[0];

    if (!file) {
      return ResponseHandler.fail(res, responseMessages.fail.FILE_UPLOAD, status.BAD_REQUEST);
    }

    // Return the relative path (key).
    // The frontend will prepend NEXT_PUBLIC_DO_URL to display it.
    return ResponseHandler.success(
      res,
      {
        relativePath: `${file.key}`, // Ensure leading slash for consistency
        fullUrl: `${process.env.DO_ENDPOINT}/${file.key}`,
      },
      responseMessages.success.IMAGE_UPLOADED,
      status.OK,
    );
  } catch (error) {
    return ResponseHandler.fail(
      res,
      error.message,
      status.INTERNAL_SERVER_ERROR,
    );
  }
};
