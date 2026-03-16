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

  let query: Record<string, unknown> = {};

  if (filter === "following") {
    const loggedInUser = await User.findById(userId).lean();

    if (!loggedInUser) {
      throw new AppError("User not found", 404);
    }

    query.author = { $in: loggedInUser.following };
  }
  return Post.find(query)
    .sort({ createdAt: -1 })
    .populate("author", "username avatar name")
    .populate("likes", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
};

const getPostById = async (postId: string) => {
  const post = await Post.findById(postId)
    .populate("author", "username avatar name")
    .populate("likes", "username avatar name");
  if (!post) throw new AppError("Post not found", 404);
  return post;
};

const createPost = async (data: {
  content: PostContent;
  author: mongoose.Types.ObjectId;
}) => {
  if (!data.content.image && !data.content.text.length)
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
  if (!post.content.image && !data.content.image && !data.content.text.length)
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
  session.startTransaction();
  const post = await Post.findById(postId).session(session);
  if (!post) throw new AppError("Post not found", 404);

  await Post.findByIdAndDelete(postId).session(session);
  const success = await deleteImageFromCloudinary(post.content.image?.publicId);
  if (!success) {
    throw new AppError("Failed to delete image from Cloudinary", 500);
  }
  await Comment.deleteMany({ postId }).session(session);

  await session.commitTransaction();
  session.endSession();
};

const likePost = async (postId: string, userId: mongoose.Types.ObjectId) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);

  if (post.likes.includes(userId)) {
    await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
    return "Post unliked successfully";
  } else {
    await Post.updateOne({ _id: postId }, { $addToSet: { likes: userId } });
    return "Post liked successfully";
  }
};

const createComment = async (
  postId: string,
  content: string,
  author: mongoose.Types.ObjectId
) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);

  return Comment.create({ postId, content, author });
};

const getPostComments = async (postId: string, page: number, limit: number) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);

  const skip = (page - 1) * limit;
  return Comment.find({ postId })
    .sort({ createdAt: -1 })
    .populate("author", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
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
};
