import type { Request, Response } from "express";
import * as commentsService from "./comment.service";
import mongoose from "mongoose";
import { createCommentDto, updateCommentDto } from "./comment.dto";
import AppError from "../../shared/utils/AppError";

/**
 * @route POST /api/posts/:postId/comments
 * @desc Add a comment to a post
 * @access Private (Requires authentication)
 */
export const createComment = async (req: Request, res: Response) => {
  const parsedBody = createCommentDto.parse(req.body);
  const author = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  if (!author) {
    throw new AppError("Unauthorized", 401);
  }
  const postId = req.params.postId as string;
  const comment = await commentsService.createComment({
    postId,
    body: parsedBody,
    author,
  });
  res.status(201).json(comment);
};

/**
 * @route GET /api/posts/:postId/comments
 * @desc Get comments of a post
 * @access Public
 */
export const getPostComments = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const comments = await commentsService.getPostComments({
    postId,
    page,
    limit,
  });
  res.status(200).json(comments);
};

/**
 * @route PUT /api/posts/:postId/comments/:commentId
 * @desc Update a comment
 * @access Private (Requires authentication and ownership)
 */
export const updateComment = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const parsedBody = updateCommentDto.parse(req.body);

  const comment = await commentsService.updateComment(commentId, parsedBody);

  res.status(200).json({
    message: "Comment updated successfully",
    comment,
  });
};

/**
 * @route DELETE /api/posts/:postId/comments/:commentId
 * @desc Delete a comment
 * @access Private (Requires authentication and ownership)
 */
export const deleteComment = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;

  await commentsService.deleteComment(commentId);

  res.status(200).json({
    message: "Comment deleted successfully",
  });
};

/**
 * @route POST /api/posts/:postId/comments/:commentId/likes
 * @desc Like a comment
 * @access Private (Requires authentication)
 */
export const likeComment = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const userId = req.JwtPayload?.userId as mongoose.Types.ObjectId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const comment = await commentsService.likeComment(commentId, userId);

  res.status(200).json({
    message: "Comment liked successfully",
    comment,
  });
};

/**
 * @route DELETE /api/posts/:postId/comments/:commentId/likes
 * @desc Unlike a comment
 * @access Private (Requires authentication)
 */
export const unlikeComment = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const userId = req.JwtPayload?.userId as mongoose.Types.ObjectId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const comment = await commentsService.unlikeComment(commentId, userId);

  res.status(200).json({
    message: "Comment unliked successfully",
    comment,
  });
};

/**
 * @route GET /api/posts/:postId/comments/:commentId/likes
 * @desc Get likes of a comment (paginated)
 * @access Public
 */
export const getCommentLikes = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit as string) || 10)
  );
  const likes = await commentsService.getCommentLikes(commentId, page, limit);
  res.status(200).json(likes);
};
