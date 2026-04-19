import mongoose from "mongoose";
import Comment from "./Comment.model";
import AppError from "@/shared/utils/AppError";
import { CreateCommentDto, UpdateCommentDto } from "./comment.dto";
import Post from "@/modules/posts/Post.model";
import { CommentLike } from "./CommentLike.model";
import { GetPostCommentsParams } from "./comment.types";
import User from "@/modules/users/User.model";
import notificationService from "@/modules/notifications/notification.service";
import { NotificationType } from "@/modules/notifications/Notification.model";

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

  // Create notification
  await notificationService.createNotification({
    recipient: post.author,
    sender: author,
    type: NotificationType.COMMENT,
    post: postId,
    comment: comment._id as mongoose.Types.ObjectId,
  });

  return comment;
};

export const getPostComments = async ({
  page,
  limit,
  postId,
  authenticatedUserId,
}: GetPostCommentsParams) => {
  const skip = (page - 1) * limit;


  const comments = await Comment.aggregate([
    { $match: { postId } },
    { $sort: { createdAt: -1, _id: -1 } },
    { $skip: skip },
    { $limit: limit },

    {
      $lookup: {
        from: "users",
        let: { authorId: "$author" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$authorId"],
              },
            },
          },
          {
            $project: {
              name: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
        as: "author",
      },
    },

    { $unwind: "$author" },

    {
      $lookup: {
        from: "commentlikes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$commentId", "$$commentId"] },
                  {
                    $eq: [
                      "$userId",
                      new mongoose.Types.ObjectId(authenticatedUserId),
                    ],
                  },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "likes",
      },
    },

    {
      $addFields: {
        isLiked: { $gt: [{ $size: "$likes" }, 0] },
      },
    },

    {
      $project: {
        likes: 0,
        __v: 0,
      },
    },
  ]);
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
      throw new AppError("You have already liked this comment", 400);
    }
    const commentLike = await CommentLike.create([{ commentId, userId }], {
      session,
    });
    await Comment.updateOne(
      { _id: commentId },
      { $inc: { likesCount: 1 } },
      { session }
    );

    // Create notification (need to find comment to get recipient)
    const comment = await Comment.findById(commentId).session(session);
    if (comment) {
      await notificationService.createNotification({
        recipient: comment.author,
        sender: userId,
        type: NotificationType.LIKE,
        comment: commentId,
      });
    }

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
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError("Comment not found", 404);
  const commentLikedByIds = await CommentLike.find({ commentId }).distinct("userId");

  const commentLikedBy = await User.find({ _id: { $in: commentLikedByIds } })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalCommentLikes = await CommentLike.countDocuments({ commentId });

  const hasNextPage = skip + limit < totalCommentLikes;
  return {
    data: commentLikedBy,
    total: totalCommentLikes,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : null,
  };
};
