import mongoose from "mongoose";
import User from "./User.model";
import { UpdateUserProfileDto } from "./users.dto";
import AppError from "../../shared/utils/AppError";
import { Follow } from "./follow.model";
import { deleteImageFromCloudinary } from "../../shared/utils/cloudinaryUtils";
import Post from "../posts/Post.model";
import { PostLike } from "../posts/PostLike.model";

export const getFollowSuggestions = async ({
  currentUserId,
  page,
  limit,
}: {
  currentUserId: mongoose.Types.ObjectId;
  page: number;
  limit: number;
}) => {
  const skip = (page - 1) * limit;

  const followingsIds = await Follow.find({
    followerId: currentUserId,
  }).distinct("followingId");
  const followSuggestions = await User.find({
    _id: { $nin: [...followingsIds, currentUserId] },
  })
    .sort({ followersCount: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  const totalFollowSuggestions = await User.countDocuments({
    _id: { $ne: currentUserId },
  });
  const hasNextPage = skip + limit < totalFollowSuggestions;
  return {
    data: followSuggestions,
    total: totalFollowSuggestions,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};

export const getUserProfile = async (username: string) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const updateUserProfile = async (
  userId: mongoose.Types.ObjectId,
  data: UpdateUserProfileDto,
  profilePicture: { url?: string; publicId?: string }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const oldAvatarPublicId = user.avatar?.publicId;
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        ...data,
        avatar: profilePicture.url ? profilePicture : user.avatar,
      },
      { new: true }
    );
    if (profilePicture.url && oldAvatarPublicId) {
      await deleteImageFromCloudinary(oldAvatarPublicId);
    }
    await session.commitTransaction();
    return updatedUser;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const deleteUserProfile = async (userId: mongoose.Types.ObjectId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (user.avatar?.publicId) {
      await deleteImageFromCloudinary(user.avatar?.publicId);
    }
    await session.commitTransaction();
    return user;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getUserPosts = async ({
  username,
  page,
  limit,
  filter,
}: {
  username: string;
  page: number;
  limit: number;
  filter?: string;
}) => {
  const skip = (page - 1) * limit;

  let matchQuery: Record<string, unknown> = {};

  const user = await User.findOne({ username });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userLikedPostsIds = await PostLike.find({ userId: user._id }).distinct(
    "_id"
  );

  if (filter === "liked") {
    matchQuery._id = { $in: userLikedPostsIds };
  } else {
    matchQuery.author = user._id;
  }
  const profilePosts = await Post.find(matchQuery)
    .sort({ createdAt: -1 })
    .populate("author", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
  const totalPosts = await Post.countDocuments(matchQuery);
  const hasNextPage = skip + limit < totalPosts;
  return {
    data: profilePosts,
    total: totalPosts,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};

export const getUserFollowers = async ({
  username,
  page,
  limit,
}: {
  username: string;
  page: number;
  limit: number;
}) => {
  const skip = (page - 1) * limit;

  const user = await User.findOne({ username });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userFollowersIds = await Follow.find({
    followingId: user._id,
  }).distinct("_id");

  const userFollowers = await User.find({ _id: { $in: userFollowersIds } })
    .sort({ createdAt: -1 })
    .populate("author", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
  const totalPosts = await User.countDocuments({
    _id: { $in: userFollowersIds },
  });
  const hasNextPage = skip + limit < totalPosts;
  return {
    data: userFollowers,
    total: totalPosts,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};

export const getUserFollowing = async ({
  username,
  page,
  limit,
}: {
  username: string;
  page: number;
  limit: number;
}) => {
  const skip = (page - 1) * limit;

  const user = await User.findOne({ username });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userFollowingsIds = await Follow.find({
    followerId: user._id,
  }).distinct("_id");

  const followings = await User.find({ _id: { $in: userFollowingsIds } })
    .sort({ createdAt: -1 })
    .populate("author", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
  const totalPosts = await User.countDocuments({
    _id: { $in: userFollowingsIds },
  });
  const hasNextPage = skip + limit < totalPosts;
  return {
    data: followings,
    total: totalPosts,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};

export const followUser = async (
  followerId: mongoose.Types.ObjectId,
  followingId: mongoose.Types.ObjectId
) => {
  if (followerId.equals(followingId)) {
    throw new Error("You can't follow yourself");
  }
  const followResult = Follow.create({ followerId, followingId });
  await User.updateOne({ _id: followingId }, { $inc: { followersCount: 1 } });
  await User.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } });
  return followResult;
};

export const unfollowUser = async (
  followerId: mongoose.Types.ObjectId,
  followingId: mongoose.Types.ObjectId
) => {
  if (followerId.equals(followingId)) {
    throw new Error("You can't unfollow yourself");
  }
  const unfollowResult = Follow.deleteOne({ followerId, followingId });
  await User.updateOne({ _id: followingId }, { $inc: { followersCount: -1 } });
  await User.updateOne({ _id: followerId }, { $inc: { followingCount: -1 } });
  return unfollowResult;
};
