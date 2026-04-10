import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import AppError from "../utils/AppError";
import Comment from "../../modules/comments/Comment.model";
import Post from "../../modules/posts/Post.model";
import mongoose from "mongoose";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;
  const jwtPayload = verifyAccessToken(token);
  if (!jwtPayload) {
    throw new AppError("Invalid or expired token", 401);
  }
  req.JwtPayload = jwtPayload;
  next();
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;
  if (token) {
    const jwtPayload = verifyAccessToken(token);
    if (jwtPayload) {
      req.JwtPayload = jwtPayload;
    }
  }
  next();
};

export const authorizePostOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId as string;
  const userId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (post.author.toString() !== userId.toString()) {
    throw new AppError("Unauthorized to update or delete this post", 403);
  }
  next();
};

export const authorizeCommentOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId as string;
  const userId = req.JwtPayload?.userId;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  if (comment.author.toString() !== userId?.toString()) {
    throw new AppError("Unauthorized to update or delete this comment", 403);
  }
  next();
};

export const authorizeProfileOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId as string;
  const loggedInUserId = req.JwtPayload?.userId;
  const user = await Post.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user._id.toString() !== loggedInUserId?.toString()) {
    throw new AppError("Unauthorized to update or delete this profile", 403);
  }
  next();
};
