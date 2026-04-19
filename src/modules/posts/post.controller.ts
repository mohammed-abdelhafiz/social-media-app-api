// controllers/post.controller.ts
import { Request, Response } from "express";
import * as postService from "./post.service";
import { createPostDto, updatePostDto } from "./posts.dto";
import mongoose from "mongoose";
import AppError from "@/shared/utils/AppError";

export const getFeedPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
  const filter = req.query.filter as string | undefined;
  const authenticatedUserId = req.JwtPayload?.userId;
  if (!authenticatedUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (filter && !["for-you", "following"].includes(filter)) {
    return res.status(400).json({ error: "Invalid filter value" });
  }
  const feedPosts = await postService.getFeedPosts({
    page,
    limit,
    filter,
    authenticatedUserId,
  });
  res.status(200).json(feedPosts);
};

/**
 * @route GET /api/posts/:postId
 * @desc Get a post by ID
 * @access Public
 */
export const getPostById = async (req: Request, res: Response) => {
  const postId = new mongoose.Types.ObjectId(req.params.postId as string);
  const post = await postService.getPostById(postId);
  res.status(200).json(post);
};

/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private (Requires authentication)
 */
export const createPost = async (req: Request, res: Response) => {
  const authenticatedUserId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  const parsedBody = createPostDto.parse(req.body);
  const image = req.file;
  const authorId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  const newPost = await postService.createPost({
    author: authorId,
    content: {
      text: parsedBody.text,
      image: image && {
        url: image.path,
        publicId: image.filename,
      },
    },
    authenticatedUserId,
  });
  res.status(201).json(newPost);
};

/**
 * @route PUT /api/posts/:postId
 * @desc Update a post
 * @access Private (Requires authentication and ownership)
 */
export const updatePost = async (req: Request, res: Response) => {
  const parsedBody = updatePostDto.parse(req.body);
  const image = req.file;
  const postId = new mongoose.Types.ObjectId(req.params.postId as string);
  const removeOldImage = req.body.removeOldImage === "true";
  const updatedPost = await postService.updatePost({
    content: {
      text: parsedBody.text,
      image: image && {
        url: image.path,
        publicId: image.filename,
      },
      removeOldImage,
    },
    postId,
  });
  res.status(200).json(updatedPost);
};

/**
 * @route DELETE /api/posts/:postId
 * @desc Delete a post
 * @access Private (Requires authentication and ownership)
 */
export const deletePost = async (req: Request, res: Response) => {
  const postId = new mongoose.Types.ObjectId(req.params.postId as string);
  await postService.deletePost(postId);
  res.status(204).json({ message: "Post deleted successfully" });
};

/**
 * @route POST /api/posts/:postId/likes
 * @desc Like a post
 * @access Private (Requires authentication)
 */
export const likePost = async (req: Request, res: Response) => {
  const userId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }
  const postId = new mongoose.Types.ObjectId(req.params.postId as string);
  await postService.likePost(postId, userId);
  res.status(200).json({ message: "Post liked successfully" });
};
/**
 * @route DELETE /api/posts/:postId/likes
 * @desc unlike a post
 * @access Private (Requires authentication)
 */
export const unlikePost = async (req: Request, res: Response) => {
  const userId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }
  const postId = new mongoose.Types.ObjectId(req.params.postId as string);
  await postService.unlikePost(postId, userId);
  res.status(200).json({ message: "Post unliked successfully" });
};

/**
 * @route GET /api/posts/:postId/likes
 * @desc Get likes of a post (paginated)
 * @access Public
 */
export const getPostLikes = async (req: Request, res: Response) => {
  const postId = new mongoose.Types.ObjectId(req.params.postId as string);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const likes = await postService.getPostLikes(postId, page, limit);
  res.status(200).json(likes);
};
