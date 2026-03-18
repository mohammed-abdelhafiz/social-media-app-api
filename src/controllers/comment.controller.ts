import type { Request, Response } from "express";
import { updateCommentSchema } from "../schemas/posts.schema";
import commentsService from "../services/comment.service";
import mongoose from "mongoose";

/**
 * @route PUT /api/comments/:commentId
 * @desc Update a comment
 * @access Private (Requires authentication and ownership)
 */
const updateComment = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const parsedBody = updateCommentSchema.parse(req.body);

  const comment = await commentsService.updateComment(commentId, parsedBody);

  res.status(200).json({
    message: "Comment updated successfully",
    comment,
  });
};

/**
 * @route DELETE /api/comments/:commentId
 * @desc Delete a comment
 * @access Private (Requires authentication and ownership)
 */
const deleteComment = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;

  const comment = await commentsService.deleteComment(commentId);

  res.status(200).json({
    message: "Comment deleted successfully",
    comment,
  });
};

/**
 * @route POST /api/comments/:commentId/like
 * @desc Like a comment
 * @access Private (Requires authentication)
 */
const likeComment = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const userId = req.JwtPayload?.userId as mongoose.Types.ObjectId;

  const comment = await commentsService.likeComment(commentId, userId);

  res.status(200).json({
    message: "Comment liked successfully",
    comment,
  });
};

/**
 * @route GET /api/comments/:commentId/likes
 * @desc Get likes of a comment (paginated)
 * @access Public
 */
const getCommentLikes = async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const likes = await commentsService.getCommentLikes(commentId, page, limit);
  res.status(200).json(likes);
};

export default {
  updateComment,
  deleteComment,
  likeComment,
  getCommentLikes,
};
