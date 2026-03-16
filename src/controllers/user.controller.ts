import type { Request, Response } from "express";
import usersService from "../services/user.service";
import { updateUserProfileSchema } from "../schemas/users.schema";

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Public
 */
const getAllUsers = async (req: Request, res: Response) => {
  const users = await usersService.getAllUsers();
  res.status(200).json(users);
};

/**
 * @route GET /api/users/:id
 * @desc Get single user by ID or username
 * @access Public
 */
const getUser = async (req: Request, res: Response) => {
  const userIdOrUsername = req.params.id as string;
  const user = await usersService.getUser(userIdOrUsername);
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
export default {
  getAllUsers,
  getUser,
  updateUserProfile,
  deleteUserAccount,
};
