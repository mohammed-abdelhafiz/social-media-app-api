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
  const result = await Comment.updateOne(
    { _id: commentId, likes: userId },
    {
      $pull: { likes: userId },
      $inc: { likesCount: -1 },
      likedByCurrentUser: false,
    }
  );
  if (result.modifiedCount === 0) {
    await Comment.updateOne(
      { _id: commentId },
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
        likedByCurrentUser: true,
      }
    );
    return "Comment liked successfully";
  }
  return "Comment disliked successfully";
};

const getCommentLikes = async (
  commentId: string,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;
  const comment = await Comment.findById(commentId)
    .select("likedBy likesCount")
    .populate("likedBy", "username avatar name")
    .skip(skip)
    .limit(limit)
    .lean();
  if (!comment) throw new AppError("Comment not found", 404);
  const hasNextPage = skip + limit < (comment?.likesCount || 0);
  return {
    data: comment?.likedBy || [],
    total: comment?.likesCount || 0,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};

export default {
  updateComment,
  deleteComment,
  likeComment,
  getCommentLikes,
};
