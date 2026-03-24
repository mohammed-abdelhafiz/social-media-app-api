import mongoose from "mongoose";
import Post from "./Post.model";
import AppError from "../../shared/utils/AppError";
import { GetFeedPostsParams, PostContent } from "./post.types";
import { Follow } from "../users/follow.model";
import Comment from "../comments/Comment.model";
import { PostLike } from "./PostLike.model";
import { deleteImageFromCloudinary } from "../../shared/utils/cloudinaryUtils";

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
  const posts = await Post.find(matchQuery)
    .sort({ createdAt: -1, _id: -1 })
    .populate("author", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
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

export const createPost = async (data: {
  content: PostContent;
  authorId: mongoose.Types.ObjectId;
}) => {
  if (!data.content.image && !data.content.text)
    throw new AppError("Post must have text or image", 400);
  return Post.create(data);
};

export const updatePost = async (data: {
  content: PostContent;
  postId: mongoose.Types.ObjectId;
}) => {
  const post = await Post.findById(data.postId);
  if (!post) throw new AppError("Post not found", 404);
  if (!data.content.image && !data.content.text)
    throw new AppError("Post must have text or image", 400);
  if (data.content.text === post.content.text && !data.content.image)
    return post;
  if (data.content.text) {
    post.content.text = data.content.text;
  }
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
    await PostLike.create([{ postId, userId }], { session });

    await Post.updateOne(
      { _id: postId },
      { $inc: { likesCount: 1 } },
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

export const unlikePost = async (
  postId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await PostLike.deleteOne([{ postId, userId }], { session });

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
  const postLikes = await PostLike.aggregate([
    { $match: { postId } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "likedBy",
      },
    },
  ]);

  const totalPostLikes = await PostLike.countDocuments({ postId });

  const hasNextPage = skip + limit < totalPostLikes;
  return {
    data: postLikes,
    total: totalPostLikes,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};
