import mongoose from "mongoose";
import Post from "../models/Post.model";
import AppError from "../utils/AppError";
import Comment from "../models/Comment.model";

const getAllPosts = async () => {
  const posts = await Post.find()
    .sort({ createdAt: "desc" })
    .populate("comments");
  return posts;
};

const getPostById = async (postId: string) => {
  const post = await Post.findById(postId).populate("comments");
  return post;
};

const createPost = async (data: { content: string; userId: string }) => {
  const newPost = await Post.create(data);
  return newPost;
};

const updatePost = async (
  postId: string,
  data: {
    content?: string | undefined;
  }
) => {
  const updatedPost = await Post.findByIdAndUpdate(postId, data, { new: true });
  return updatedPost;
};

const deletePost = async (postId: string) => {
  await Post.findByIdAndDelete(postId);
  await Comment.deleteMany({ postId });
};

const likePost = async (postId: string, userId: mongoose.Types.ObjectId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  let message;
  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    message = "Post unliked successfully";
  } else {
    post.likes.push(userId);
    message = "Post liked successfully";
  }

  await post.save();

  return message;
};

const createComment = async (
  postId: string,
  data: { content: string },
  userId: mongoose.Types.ObjectId
) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  const comment = await Comment.create({
    postId,
    ...data,
    userId,
  });
  return comment;
};

const getPostComments = async (postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  const comments = await Comment.find({ postId }).sort({ createdAt: "desc" });
  return comments;
};

const updateComment = async (
  postId: string,
  commentId: string,
  data: {
    content?: string | undefined;
  }
) => {
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, postId },
    data,
    { new: true }
  );
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  return comment;
};

const deleteComment = async (postId: string, commentId: string) => {
  const comment = await Comment.findOneAndDelete({ _id: commentId, postId });
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  return comment;
};

export default {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};
