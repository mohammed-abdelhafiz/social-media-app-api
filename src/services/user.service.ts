import User from "../models/User.model";
import { UpdateUserProfileBody } from "../schemas/users.schema";
import AppError from "../utils/AppError";

const getAllUsers = async () => {
  const users = await User.find();
  return users;
};

const getUser = async (userIdOrUsername: string) => {
  const user = await User.findOne({
    $or: [{ _id: userIdOrUsername }, { username: userIdOrUsername }],
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const updateUserProfile = async (
  username: string,
  data: UpdateUserProfileBody
) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (data.profilePicture) {
    // Handle profile picture update logic here
  }
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { ...data },
    { new: true }
  );
  return updatedUser;
};

export default {
  getAllUsers,
  getUser,
  updateUserProfile,
};
