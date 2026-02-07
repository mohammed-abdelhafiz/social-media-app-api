import type { Request, Response } from "express";
import postsService from "../services/posts.service";
import {
  createCommentSchema,
  createPostSchema,
  updateCommentSchema,
  updatePostSchema,
} from "../schemas/posts.schema";
import AppError from "../utils/AppError";

const getAllPosts = async (_req: Request, res: Response) => {
  const posts = await postsService.getAllPosts();
  res.status(200).json(posts);
};

const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;

  const post = await postsService.getPostById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  res.status(200).json(post);
};

const createPost = async (req: Request, res: Response) => {
  const { content } = createPostSchema.parse(req.body);
  const userId = req.JwtPayload.userId;

  const newPost = await postsService.createPost({ content, userId });

  res.status(201).json({
    message: "Post created successfully",
    data: newPost,
  });
};

const updatePost = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const parsedBody = updatePostSchema.parse(req.body);

  const updatedPost = await postsService.updatePost(postId, parsedBody);

  res.status(200).json({
    message: "Post updated successfully",
    data: updatedPost,
  });
};

const deletePost = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;

  await postsService.deletePost(postId);

  res.status(200).json({ message: "Post deleted successfully" });
};

const likePost = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const userId = req.JwtPayload.userId;

  const message = await postsService.likePost(postId, userId);

  res.status(200).json({ message });
};

// =======================
// COMMENTS
// =======================

const createComment = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const userId = req.JwtPayload.userId;
  const parsedBody = createCommentSchema.parse(req.body);

  const comment = await postsService.createComment(
    postId,
    parsedBody,
    userId
  );

  res.status(201).json({
    message: "Comment added successfully",
    data: comment,
  });
};

const getPostComments = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;

  const comments = await postsService.getPostComments(postId);

  res.status(200).json({
    message: "Comments fetched successfully",
    data: comments,
  });
};

const updateComment = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const commentId = req.params.commentId as string;
  const parsedBody = updateCommentSchema.parse(req.body);

  const comment = await postsService.updateComment(
    postId,
    commentId,
    parsedBody
  );

  res.status(200).json({
    message: "Comment updated successfully",
    data: comment,
  });
};

const deleteComment = async (req: Request, res: Response) => {
  const postId = req.params.postId as string;
  const commentId = req.params.commentId as string;

  const comment = await postsService.deleteComment(postId, commentId);

  res.status(200).json({
    message: "Comment deleted successfully",
    data: comment,
  });
};

export default {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
};
