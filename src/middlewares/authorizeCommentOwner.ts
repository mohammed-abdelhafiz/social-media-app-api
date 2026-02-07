import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Comment from "../models/Comment.model";

const authorizeCommentOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId as string;
  const userId = req.JwtPayload.userId;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.userId.toString() !== userId) {
    throw new AppError("Unauthorized to update or delete this comment", 403);
  }
  next();
};

export default authorizeCommentOwner;
