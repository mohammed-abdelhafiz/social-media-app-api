import type { Request, Response } from "express";
import * as usersService from "./user.service";
import { updateUserProfileDto } from "./users.dto";
import mongoose from "mongoose";
import AppError from "../../shared/utils/AppError";

/**
 * @route GET /api/users/followSuggestions
 * @desc Get follow suggestions
 * @access Public
 */
export const getFollowSuggestions = async (req: Request, res: Response) => {
  const currentUserId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  if (!currentUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const suggestions = await usersService.getFollowSuggestions({
    currentUserId,
    page,
    limit,
  });
  res.status(200).json(suggestions);
};

/**
 * @route GET /api/users/:username
 * @desc Get single user by username
 * @access Public
 */
export const getUserProfile = async (req: Request, res: Response) => {
  const authenticatedUserId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  const username = req.params.username as string;
  const user = await usersService.getUserProfile({username,authenticatedUserId});
  res.status(200).json(user);
};

/**
 * @route PUT /api/users/:userId
 * @desc Update user profile
 * @access Private (Requires authentication and ownership)
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.params.userId as string);
  const parsedBody = updateUserProfileDto.parse(req.body);
  const profilePicture = req.file;
  const updatedUser = await usersService.updateUserProfile(userId, parsedBody, {
    url: profilePicture?.path,
    publicId: profilePicture?.filename,
  });
  res.status(200).json({
    message: "profile updated successfully",
    user: updatedUser,
  });
};

/**
 * @route DELETE /api/users/:userId
 * @desc Delete user account
 * @access Private (Requires authentication and ownership)
 */
export const deleteUserProfile = async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.params.userId as string);
  await usersService.deleteUserProfile(userId);
  res.status(200).json({
    message: `user with id ${userId} deleted successfully`,
  });
};

/**
 * @route GET /api/users/:username/posts
 * @desc Get user posts
 * @access Public
 */

export const getUserPosts = async (req: Request, res: Response) => {
  const authenticatedUserId = req.JwtPayload?.userId as mongoose.Types.ObjectId;
  const username = req.params.username as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const filter = req.query.filter as string | undefined; //posted or liked
  const userPosts = await usersService.getUserPosts({
    username,
    page,
    limit,
    filter,
    authenticatedUserId,
  });
  res.status(200).json(userPosts);
};

/**
 * @route GET /api/users/:username/followers
 * @desc Get user followers
 * @access Public
 */
export const getUserFollowers = async (req: Request, res: Response) => {
  const username = req.params.username as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const followers = await usersService.getUserFollowers({
    username,
    page,
    limit,
  });
  res.status(200).json(followers);
};

/**
 * @route GET /api/users/:username/followings
 * @desc Get user followings
 * @access Public
 */
export const getUserFollowings = async (req: Request, res: Response) => {
  const username = req.params.username as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const followings = await usersService.getUserFollowing({
    username,
    page,
    limit,
  });
  res.status(200).json(followings);
};

/**
 * @route POST /api/users/:username/follow
 * @desc Follow a user
 * @access Private (Requires authentication)
 * */
export const followUser = async (req: Request, res: Response) => {
  const authenticatedUserId = req.JwtPayload?.userId;
  if (!authenticatedUserId) {
    throw new AppError("Unauthorized", 401);
  }
  const targetUsername = req.params.username as string
  await usersService.followUser(
    authenticatedUserId,
    targetUsername
  );
  res.status(200).json({ message: "followed successfully" });
};

/**
 * @route DELETE /api/users/:username/follow
 * @desc Unfollow a user
 * @access Private (Requires authentication)
 * */
export const unfollowUser = async (req: Request, res: Response) => {
  const authenticatedUserId = req.JwtPayload?.userId;
  if (!authenticatedUserId) {
    throw new AppError("Unauthorized", 401);
  }
  const targetUsername = req.params.username as string
  await usersService.unfollowUser(authenticatedUserId, targetUsername);
  res.status(20).json({ message: "unfollowed successfully" });
};
