import Post from "../models/Post.model";
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

export default { getAllPosts, createPost, getPostById, updatePost, deletePost };
