import mongoose from "mongoose";
import User from "./User.model";
import { UpdateUserProfileDto } from "./users.dto";
import AppError from "../../shared/utils/AppError";
import { Follow } from "./follow.model";
import { deleteImageFromCloudinary } from "../../shared/utils/cloudinaryUtils";
import Post from "../posts/Post.model";
import { PostLike } from "../posts/PostLike.model";
import { getUserPostsArgs } from "./user.types";

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

export const getUserProfile = async ({
  username,
  authenticatedUserId,
}: {
  username: string;
  authenticatedUserId: mongoose.Types.ObjectId;
}) => {
  const user = await User.aggregate([
    { $match: { username } },
    {
      $lookup: {
        from: "follows",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: {
                  $and: [
                    { $eq: ["$followingId", "$$userId"] },
                    { $eq: ["$followerId", authenticatedUserId] },
                  ],
                },
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
        as: "follows",
      },
    },
    {
      $addFields: {
        isFollowing: { $size: "$follows" },
      },
    },
    {
      $project: {
        follows: 0,
      },
    },
  ]);
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
  authenticatedUserId,
}: getUserPostsArgs) => {
  const skip = (page - 1) * limit;

  let matchQuery: Record<string, unknown> = {};

  if (filter === "liked") {
    const likedPostIds = await PostLike.find({
      userId: authenticatedUserId,
    }).distinct("postId");

    if (likedPostIds.length === 0) {
      return {
        data: [],
        total: 0,
        hasNextPage: false,
        nextPage: null,
      };
    }

    matchQuery._id = { $in: likedPostIds };
  } else if (filter === "posted") {
    const user = await User.findOne({ username });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const userPostsIds = await Post.find({
      author: user._id,
    }).distinct("_id");

    if (userPostsIds.length === 0) {
      return {
        data: [],
        total: 0,
        hasNextPage: false,
        nextPage: null,
      };
    }

    matchQuery._id = { $in: userPostsIds };
  }
  const posts = await Post.aggregate([
    { $match: matchQuery },
    { $sort: { createdAt: -1, _id: -1 } },
    { $skip: skip },
    { $limit: limit },

    {
      $lookup: {
        from: "users",
        let: { authorId: "$author" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$authorId"],
              },
            },
          },
          {
            $project: {
              name: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
        as: "author",
      },
    },

    { $unwind: "$author" },

    {
      $lookup: {
        from: "postlikes",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$postId", "$$postId"] },
                  {
                    $eq: [
                      "$userId",
                      new mongoose.Types.ObjectId(authenticatedUserId),
                    ],
                  },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "likes",
      },
    },

    {
      $addFields: {
        isLiked: { $gt: [{ $size: "$likes" }, 0] },
      },
    },

    {
      $project: {
        likes: 0,
        __v: 0,
      },
    },
  ]);
  const totalPosts = await Post.countDocuments(matchQuery);
  const hasNextPage = skip + limit < totalPosts;
  return {
    data: posts,
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
  authenticatedUserId: mongoose.Types.ObjectId,
  targetUsername: string
) => {
  const targetUser = await User.findOne({ username: targetUsername });
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }
  if (targetUser._id.equals(authenticatedUserId)) {
    throw new AppError("You can't follow yourself", 400);
  }
  if (
    await Follow.findOne({
      followerId: authenticatedUserId,
      followingId: targetUser._id,
    })
  ) {
    throw new AppError("You are already following this user", 400);
  }
  Follow.create({
    followerId: authenticatedUserId,
    followingId: targetUser._id,
  });
  await User.updateOne(
    { _id: targetUser._id },
    { $inc: { followersCount: 1 } }
  );
  await User.updateOne(
    { _id: authenticatedUserId },
    { $inc: { followingCount: 1 } }
  );
};

export const unfollowUser = async (
  authenticatedUserId: mongoose.Types.ObjectId,
  targetUsername: string
) => {
  const targetUser = await User.findOne({ username: targetUsername });
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }
  if (targetUser._id.equals(authenticatedUserId)) {
    throw new AppError("You can't unfollow yourself", 400);
  }
  Follow.deleteOne({
    followerId: authenticatedUserId,
    followingId: targetUser._id,
  });
  await User.updateOne(
    { _id: targetUser._id },
    { $inc: { followersCount: -1 } }
  );
  await User.updateOne(
    { _id: authenticatedUserId },
    { $inc: { followingCount: -1 } }
  );
};
