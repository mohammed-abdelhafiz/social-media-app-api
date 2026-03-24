import mongoose from "mongoose";
import Comment from "./Comment.model";
import AppError from "../../shared/utils/AppError";
import { CreateCommentDto, UpdateCommentDto } from "./comment.dto";
import Post from "../posts/Post.model";
import { CommentLike } from "./CommentLike.model";

export const createComment = async ({
  postId,
  body: { content },
  author,
}: {
  postId: mongoose.Types.ObjectId;
  body: CreateCommentDto;
  author: mongoose.Types.ObjectId;
}) => {
  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);
  const comment = await Comment.create({ postId, content, author });
  await Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });
  return comment;
};

export const getPostComments = async ({
  postId,
  page,
  limit,
}: {
  postId: mongoose.Types.ObjectId;
  page: number;
  limit: number;
}) => {
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

export const updateComment = async ({
  commentId,
  postId,
  newCommentData,
}: {
  commentId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  newCommentData: UpdateCommentDto;
}) => {
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, postId },
    newCommentData,
    {
      new: true,
    }
  );
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }
  return comment;
};

export const deleteComment = async ({
  commentId,
  postId,
}: {
  commentId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const comment = await Comment.findOneAndDelete(
      { _id: commentId, postId },
      { session }
    );
    if (!comment) {
      await session.abortTransaction();
      throw new AppError("Comment not found", 404);
    }
    await Post.updateOne(
      { _id: comment.postId },
      { $inc: { commentsCount: -1 } },
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
export const likeComment = async (
  commentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (await CommentLike.findOne({ commentId, userId })) {
      throw new AppError("You have already liked this comment", 404);
    }
    const [commentLike] = await CommentLike.create([{ commentId, userId }], {
      session,
    });
    await Comment.updateOne(
      { _id: commentId },
      { $inc: { likesCount: 1 } },
      { session }
    );
    await session.commitTransaction();
    return commentLike;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
export const unlikeComment = async (
  commentId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const commentLike = await CommentLike.findOneAndDelete(
      { commentId, userId },
      { session }
    );
    if (!commentLike) {
      throw new AppError("You have not liked this comment", 404);
    }
    await Comment.updateOne(
      { _id: commentId },
      { $inc: { likesCount: -1 } },
      { session }
    );
    await session.commitTransaction();
    return commentLike;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getCommentLikes = async (
  commentId: mongoose.Types.ObjectId,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const commentLikes = await CommentLike.aggregate([
    { $match: { commentId } },
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
  const comment = await Comment.findById(commentId).lean();
  if (!comment) throw new AppError("Comment not found", 404);
  const hasNextPage = skip + limit < (comment?.likesCount || 0);
  return {
    data: commentLikes,
    total: comment?.likesCount || 0,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};
