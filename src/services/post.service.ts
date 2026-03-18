import mongoose from "mongoose";
import Post from "../models/Post.model";
import Comment from "../models/Comment.model";
import AppError from "../utils/AppError";
import { deleteImageFromCloudinary } from "../utils/cloudinary";
import User from "../models/User.model";
import { PostContent } from "../types/utilTypes";

const getPosts = async ({
  page,
  limit,
  filter,
  userId,
}: {
  page: number;
  limit: number;
  filter?: string;
  userId: mongoose.Types.ObjectId;
}) => {
  const skip = (page - 1) * limit;

  let matchQuery: Record<string, unknown> = {};

  if (filter === "following") {
    const loggedInUser = await User.findById(userId).lean();
    if (!loggedInUser) {
      throw new AppError("User not found", 404);
    }
    matchQuery.author = { $in: loggedInUser.following };
  }

  const posts = await Post.find(matchQuery)
    .sort({ createdAt: -1 })
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

const getPostById = async (postId: string) => {
  const post = await Post.findById(postId).populate(
    "author",
    "username avatar name"
  );
  if (!post) throw new AppError("Post not found", 404);

  return post;
};

const createPost = async (data: {
  content: PostContent;
  author: mongoose.Types.ObjectId;
}) => {
  if (!data.content.image && !data.content.text?.length)
    throw new AppError("Post must have text or image", 400);
  return Post.create(data);
};

const updatePost = async (
  postId: string,
  data: {
    content: PostContent;
  }
) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);
  if (!post.content.image && !data.content.image && !data.content.text?.length)
    throw new AppError("Post must have text or image", 400);

  post.content.text = data.content.text;
  if (data.content.image) {
    const success = await deleteImageFromCloudinary(
      post.content.image?.publicId
    );
    if (!success) {
      throw new AppError("Failed to delete old image from Cloudinary", 500);
    }
    post.content.image = data.content.image;
  } else if (
    data.content.removeOldImage === "true" ||
    data.content.removeOldImage === true
  ) {
    const success = await deleteImageFromCloudinary(
      post.content.image?.publicId
    );
    if (!success) {
      throw new AppError("Failed to delete old image from Cloudinary", 500);
    }
    post.content.image = null;
  }
  const updatedPost = await post.save();
  return updatedPost;
};

const deletePost = async (postId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const post = await Post.findById(postId).session(session);
    if (!post) throw new AppError("Post not found", 404);

    await Post.findByIdAndDelete(postId).session(session);

    if (post.content.image?.publicId) {
      const success = await deleteImageFromCloudinary(
        post.content.image.publicId
      );
      if (!success) {
        throw new AppError("Failed to delete image from Cloudinary", 500);
      }
    }

    await Comment.deleteMany({ postId }).session(session);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const likePost = async (postId: string, userId: mongoose.Types.ObjectId) => {
  const result = await Post.updateOne(
    { _id: postId, likedBy: userId },
    {
      $pull: { likedBy: userId },
      $inc: { likesCount: -1 },
      likedByCurrentUser: false,
    }
  );

  if (result.modifiedCount === 0) {
    await Post.updateOne(
      { _id: postId },
      {
        $addToSet: { likedBy: userId },
        $inc: { likesCount: 1 },
        likedByCurrentUser: true,
      }
    );
    return "Post liked successfully";
  }

  return "Post disliked successfully";
};

const createComment = async (
  postId: string,
  content: string,
  author: mongoose.Types.ObjectId
) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);
  await Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });
  return Comment.create({ postId, content, author });
};

const getPostComments = async (postId: string, page: number, limit: number) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);

  const skip = (page - 1) * limit;
  const comments = await Comment.find({ postId })
    .sort({ createdAt: -1 })
    .populate("author", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
  const totalPostComments = await Comment.countDocuments({ postId });
  const hasNextPage = skip + limit < totalPostComments;
  return {
    data: comments,
    total: totalPostComments,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};

const getPostLikes = async (postId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const post = await Post.findById(postId)
    .select("likedBy likesCount")
    .populate("likedBy", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
  if (!post) throw new AppError("Post not found", 404);
  const hasNextPage = skip + limit < (post?.likesCount || 0);
  return {
    data: post?.likedBy || [],
    total: post?.likesCount || 0,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  createComment,
  getPostComments,
  getPostLikes,
};
