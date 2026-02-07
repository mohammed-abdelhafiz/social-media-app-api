import type { Request, Response } from "express";
import postsService from "../services/posts.service";
import { createPostSchema, updatePostSchema } from "../schemas/posts.schema";
import AppError from "../utils/AppError";

const getAllPosts = async (req: Request, res: Response) => {
  const posts = await postsService.getAllPosts();
  res.json(posts);
};

const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const post = await postsService.getPostById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  res.json(post);
};

const createPost = async (req: Request, res: Response) => {
  const { content } = createPostSchema.parse(req.body);
  const userId = req.JwtPayload.userId;
  const newPost = await postsService.createPost({ content, userId });
  res.status(201).json({ message: "Post created successfully", data: newPost });
};

const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const userId = req.JwtPayload.userId;

  const post = await postsService.getPostById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.userId.toString() !== userId) {
    throw new AppError("Unauthorized to update this post", 403);
  }

  const parsedBody = updatePostSchema.parse(req.body);

  const updatedPost = await postsService.updatePost(postId, parsedBody);

  res
    .status(200)
    .json({ message: "Post updated successfully", data: updatedPost });
};

const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const userId = req.JwtPayload.userId;
  const post = await postsService.getPostById(postId);

  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (post.userId.toString() !== userId) {
    throw new AppError("Unauthorized to delete this post", 403);
  }
  await postsService.deletePost(postId);
  res.status(200).json({ message: "Post deleted successfully" });
};

const likePost = async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const userId = req.JwtPayload.userId;

  const message = await postsService.likePost(postId, userId);
  res.status(200).json({ message });
};

export default {
  getAllPosts,
  createPost,
  updatePost,
  getPostById,
  deletePost,
  likePost,
};
