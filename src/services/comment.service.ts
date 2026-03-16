import mongoose from "mongoose";
import Comment from "../models/Comment.model";
import { UpdateCommentBody } from "../schemas/posts.schema";
import AppError from "../utils/AppError";

const updateComment = async (commentId: string, data: UpdateCommentBody) => {
  const comment = await Comment.findByIdAndUpdate(commentId, data, {
    new: true,
  });
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  return comment;
};

const deleteComment = async (commentId: string) => {
  const comment = await Comment.findByIdAndDelete(commentId);
  return comment;
};

const likeComment = async (
  commentId: string,
  userId: mongoose.Types.ObjectId
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  let message;
  if (comment.likes.includes(userId as unknown as mongoose.Types.ObjectId)) {
    comment.likes = comment.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
    message = "Comment unliked successfully";
  } else {
    comment.likes.push(userId as unknown as mongoose.Types.ObjectId);
    message = "Comment liked successfully";
  }
  await comment.save();
  return {
    message,
    comment,
  };
};

export default {
  updateComment,
  deleteComment,
  likeComment,
};
