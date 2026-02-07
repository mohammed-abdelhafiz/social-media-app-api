import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Post from "../models/Post.model";

const authorizePostOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId as string;
  const userId = req.JwtPayload.userId;
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (post.userId.toString() !== userId) {
    throw new AppError("Unauthorized to update or delete this post", 403);
  }
  next();
};

export default authorizePostOwner;