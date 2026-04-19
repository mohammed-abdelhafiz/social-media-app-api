import mongoose from "mongoose";
import Post from "./Post.model";
import AppError from "@/shared/utils/AppError";
import {
  CreatePostParams,
  GetFeedPostsParams,
  PostContent,
} from "./post.types";
import { Follow } from "@/modules/users/follow.model";
import Comment from "@/modules/comments/Comment.model";
import { PostLike } from "./PostLike.model";
import { deleteImageFromCloudinary } from "@/shared/utils/cloudinaryUtils";
import User from "@/modules/users/User.model";
import notificationService from "@/modules/notifications/notification.service";
import { NotificationType } from "@/modules/notifications/Notification.model";

export const getFeedPosts = async ({
  page,
  limit,
  filter,
  authenticatedUserId,
}: GetFeedPostsParams) => {
  const skip = (page - 1) * limit;

  let matchQuery: Record<string, unknown> = {};

  if (filter === "following") {
    const followingUserIds = await Follow.find({
      followerId: authenticatedUserId,
    }).distinct("followingId");

    if (followingUserIds.length === 0) {
      return {
        data: [],
        total: 0,
        hasNextPage: false,
        nextPage: null,
      };
    }

    matchQuery.author = { $in: followingUserIds };
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

export const getPostById = async (postId: mongoose.Types.ObjectId) => {
  const post = await Post.findById(postId).populate(
    "author",
    "username avatar name"
  );
  if (!post) throw new AppError("Post not found", 404);

  return post;
};

export const createPost = async ({
  author,
  content,
  authenticatedUserId,
}: CreatePostParams) => {
  if (!content.image && !content.text)
    throw new AppError("Post must have text or image", 400);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [post] = await Post.create([{ author, content }], { session });
    await User.updateOne(
      { _id: authenticatedUserId },
      { $inc: { postsCount: 1 } },
      { session }
    );
    await session.commitTransaction();
    return post;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updatePost = async (data: {
  content: PostContent;
  postId: mongoose.Types.ObjectId;
}) => {
  const post = await Post.findById(data.postId);
  if (!post) throw new AppError("Post not found", 404);
  console.log(data.content);
  if (
    !data.content.image &&
    !data.content.text &&
    !post.content.image &&
    !post.content.text
  )
    throw new AppError("Post must have text or image", 400);
  if (data.content.text === post.content.text && !data.content.image)
    return post;
  post.content.text = data.content.text;
  let public_idToDelete;
  if (data.content.image) {
    public_idToDelete = post.content.image?.publicId;
    post.content.image = data.content.image;
  } else if (data.content.removeOldImage === true) {
    public_idToDelete = post.content.image?.publicId;
    post.content.image = undefined;
  }
  const updatedPost = await post.save();
  if (public_idToDelete) {
    const success = await deleteImageFromCloudinary(public_idToDelete);
    if (!success) {
      console.log("Failed to delete old image from Cloudinary", 500);
    }
  }
  return updatedPost;
};

export const deletePost = async (postId: mongoose.Types.ObjectId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const post = await Post.findByIdAndDelete(postId).session(session);
    if (!post) throw new AppError("Post not found", 404);

    await Comment.deleteMany({ postId }).session(session);

    await session.commitTransaction();
    session.endSession();

    if (post.content.image?.publicId) {
      const success = await deleteImageFromCloudinary(
        post.content.image.publicId
      );
      if (!success) {
        console.log(
          `Failed to delete Cloudinary image: ${post.content.image.publicId}`
        );
      }
    }
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
};

export const likePost = async (
  postId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const post = await Post.findById(postId).session(session);
    if (!post) throw new AppError("Post not found", 404);

    const postLike = await PostLike.findOne({ postId, userId }).session(
      session
    );
    if (postLike) throw new AppError("You have already liked this post", 404);

    await PostLike.create([{ postId, userId }], { session });

    await Post.updateOne(
      { _id: postId },
      { $inc: { likesCount: 1 } },
      { session }
    );

    // Create notification
    await notificationService.createNotification({
      recipient: post.author,
      sender: userId,
      type: NotificationType.LIKE,
      post: postId,
    });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const unlikePost = async (
  postId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const post = await Post.findById(postId).session(session);
    if (!post) throw new AppError("Post not found", 404);

    const postLike = await PostLike.findOneAndDelete(
      { postId, userId },
      { session }
    );
    if (!postLike) throw new AppError("You have not liked this post", 404);
    await Post.updateOne(
      { _id: postId },
      { $inc: { likesCount: -1 } },
      { session }
    );
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getPostLikes = async (
  postId: mongoose.Types.ObjectId,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);
  const postLikedByIds = await PostLike.find({ postId }).distinct("userId");

  const postLikedBy = await User.find({ _id: { $in: postLikedByIds } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPostLikes = await PostLike.countDocuments({ postId });

  const hasNextPage = skip + limit < totalPostLikes;
  return {
    data: postLikedBy,
    total: totalPostLikes,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};
