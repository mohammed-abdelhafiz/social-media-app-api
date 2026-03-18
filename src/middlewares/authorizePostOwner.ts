import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Post from "../models/Post.model";
import mongoose from "mongoose";

const authorizePostOwner = async (
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

export default authorizePostOwner;
