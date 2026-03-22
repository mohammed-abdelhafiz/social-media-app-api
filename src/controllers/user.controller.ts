import type { Request, Response } from "express";
import usersService from "../services/user.service";
import { updateUserProfileSchema } from "../schemas/users.schema";

/**
 * @route GET /api/users/followSuggestions
 * @desc Get follow suggestions
 * @access Public
 */
const getFollowSuggestions = async (req: Request, res: Response) => {
  const currentUserId = req.JwtPayload?.userId;
  if (!currentUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
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
const getUserProfile = async (req: Request, res: Response) => {
  const username = req.params.username as string;
  const user = await usersService.getUser(username);
  res.status(200).json(user);
};

/**
 * @route PUT /api/users/:username
 * @desc Update user profile
 * @access Private (Requires authentication and ownership)
 */
const updateUserProfile = async (req: Request, res: Response) => {
  const username = req.params.username as string;
  const parsedBody = updateUserProfileSchema.parse(req.body);
  const updatedUser = await usersService.updateUserProfile(
    username,
    parsedBody
  );
  res.status(200).json({
    message: "profile updated successfully",
    user: updatedUser,
  });
};

/**
 * @route DELETE /api/users/:username
 * @desc Delete user account
 * @access Private (Requires authentication and ownership)
 */
const deleteUserAccount = (req: Request, res: Response) => {
  const username = req.params.username;
  res.status(200).json({
    message: `Delete user account (${username}) - Not implemented yet`,
  });
};

const followUser = async (req: Request, res: Response) => {
  const username = req.params.username as string;
  const currentUserId = req.JwtPayload?.userId;
  if (!currentUserId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { message } = await usersService.followUser(currentUserId, username);
  res.status(200).json({
    message,
  });
};

const getUserFollowers = async (req: Request, res: Response) => {
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
const getUserFollowing = async (req: Request, res: Response) => {
  const username = req.params.username as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const following = await usersService.getUserFollowing({
    username,
    page,
    limit,
  });
  res.status(200).json(following);
};

export default {
  getFollowSuggestions,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  followUser,
  getUserFollowers,
  getUserFollowing,
};
