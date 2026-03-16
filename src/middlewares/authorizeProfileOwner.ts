import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import Post from "../models/Post.model";

const authorizeProfileOwner = async (
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
  if (user._id !== loggedInUserId) {
    throw new AppError("Unauthorized to update or delete this profile", 403);
  }
  next();
};

export default authorizeProfileOwner;
