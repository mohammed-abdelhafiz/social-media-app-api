import mongoose from "mongoose";
import Post from "../models/Post.model";
import AppError from "../utils/AppError";
import { CreatePostDto } from "../utils/dtos";

const getAllPosts = async () => {
  const posts = await Post.find().sort({ createdAt: "desc" });
  // .populate("comments");
  return posts;
};

const getPostById = async (postId: string) => {
  const post = await Post.findById(postId);
  return post;
};

const createPost = async (data: CreatePostDto) => {
  const newPost = await Post.create(data);
  return newPost;
};

const updatePost = async (postId: string, data: Partial<CreatePostDto>) => {
  const updatedPost = await Post.findByIdAndUpdate(postId, data, { new: true });
  return updatedPost;
};

const deletePost = async (postId: string) => {
  await Post.findByIdAndDelete(postId);
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

const sharePost = async (postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  post.shares += 1;

  await post.save();

  return post;
};

export default {
  getAllPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  sharePost,
};
