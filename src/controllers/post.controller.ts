// controllers/post.controller.ts
import { Request, Response } from "express";
import postService from "../services/post.service";
import {
  createCommentSchema,
  createPostSchema,
  updatePostSchema,
} from "../schemas/posts.schema";
import mongoose from "mongoose";

/**
 * @route GET /api/posts
 * @desc Get all posts
 * @access Public
 */
const getPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const filter = req.query.filter as string | undefined; //for-you or following
  const posts = await postService.getPosts({
    page,
    limit,
    filter,
    userId: req.JwtPayload?.userId as mongoose.Types.ObjectId,
  });
  res.status(200).json(posts);
};

/**
 * @route GET /api/posts/:postId
 * @desc Get a post by ID
 * @access Public
 */
const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const post = await postService.getPostById(postId);
  res.status(200).json(post);
};

/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private (Requires authentication)
 */
const createPost = async (req: Request, res: Response) => {
  const parsedBody = createPostSchema.parse(req.body);
  const image = req.file;
  const author = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  const newPost = await postService.createPost({
    content: {
      text: parsedBody.text,
      image: image
        ? {
            url: image.path,
            publicId: image.filename,
          }
        : null,
    },
    author,
  });
  res.status(201).json(newPost);
};

/**
 * @route PUT /api/posts/:postId
 * @desc Update a post
 * @access Private (Requires authentication and ownership)
 */
const updatePost = async (req: Request, res: Response) => {
  const parsedBody = updatePostSchema.parse(req.body);
  const image = req.file;
  const postId = req.params.postId as string;
  const newPost = await postService.updatePost(postId, {
    content: {
      text: parsedBody.text,
      removeOldImage: parsedBody.removeOldImage,
      image: image
        ? {
            url: image.path,
            publicId: image.filename,
          }
        : null,
    },
  });
  res.status(200).json(newPost);
};

/**
 * @route DELETE /api/posts/:postId
 * @desc Delete a post
 * @access Private (Requires authentication and ownership)
 */
const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  await postService.deletePost(postId);
  res.status(204).send();
};

/**
 * @route POST /api/posts/:postId/like
 * @desc Like a post
 * @access Private (Requires authentication)
 */
const likePost = async (req: Request, res: Response) => {
  const userId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  const postId = req.params.id as string;
  const message = await postService.likePost(postId, userId);
  res.status(200).json({ message });
};

/**
 * @route POST /api/posts/:postId/comments
 * @desc Add a comment to a post
 * @access Private (Requires authentication)
 */
const createComment = async (req: Request, res: Response) => {
  const parsedBody = createCommentSchema.parse(req.body);
  const author = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  const postId = req.params.id as string;
  const comment = await postService.createComment(
    postId,
    parsedBody.content,
    author
  );
  res.status(201).json(comment);
};

/**
 * @route GET /api/posts/:postId/comments
 * @desc Get comments of a post
 * @access Public
 */
const getPostComments = async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const comments = await postService.getPostComments(postId, page, limit);
  res.status(200).json(comments);
};

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  createComment,
  getPostComments,
};
