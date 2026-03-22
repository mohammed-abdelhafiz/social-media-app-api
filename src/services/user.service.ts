import mongoose from "mongoose";
import User from "../models/User.model";
import { UpdateUserProfileBody } from "../schemas/users.schema";
import AppError from "../utils/AppError";

const getFollowSuggestions = async ({
  currentUserId,
  page,
  limit,
}: {
  currentUserId: mongoose.Types.ObjectId;
  page: number;
  limit: number;
}) => {
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new AppError("Current user not found", 404);
  }
  const skip = (page - 1) * limit;
  const users = await User.find({
    _id: { $nin: [currentUserId, ...currentUser.following] },
  })
    .skip(skip)
    .limit(limit);
  return users;
};



const getUser = async (username: string) => {
  const user = await User.findOne({ username });
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

const followUser = async (
  currentUserId: mongoose.Types.ObjectId,
  targetUsername: string
) => {
  const targetUser = await User.findOne({ username: targetUsername });
  if (!targetUser) {
    throw new AppError("Target user not found", 404);
  }
  if (targetUser._id.equals(currentUserId)) {
    throw new AppError("Cannot follow yourself", 400);
  }
  const currentUser = await User.findById(currentUserId);
  if (!currentUser) {
    throw new AppError("Current user not found", 404);
  }
  let message = "";
  if (currentUser.following.includes(targetUser._id)) {
    //unfollow logic
    currentUser.following = currentUser.following.filter(
      (id) => !id.equals(targetUser._id)
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => !id.equals(currentUserId)
    );
    message = "Unfollowed user successfully";
  } else {
    //follow logic
    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUserId);
    message = "Followed user successfully";
  }
  await currentUser.save();
  await targetUser.save();
  return { message };
};

const getUserFollowers = async ({username, page, limit}: {username: string, page: number, limit: number}) => {
  const skip = (page - 1) * limit;
  const user = await User.findOne({ username }).populate({
    path: "followers",
    options: { select: "username profilePicture",skip, limit },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user.followers;
};
const getUserFollowing = async ({username, page, limit}: {username: string, page: number, limit: number}) => {
  const skip = (page - 1) * limit;
  const user = await User.findOne({ username }).populate({
    path: "following",
    options: { select: "username profilePicture",skip, limit },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user.following;
};

export default {
  getFollowSuggestions,
  getUser,
  updateUserProfile,
  followUser,
  getUserFollowers,
  getUserFollowing,
};
