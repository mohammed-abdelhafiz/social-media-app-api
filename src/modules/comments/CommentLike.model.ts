import mongoose from "mongoose";

interface CommentLikeDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  commentId: mongoose.Types.ObjectId;
}

const CommentLikeSchema = new mongoose.Schema<CommentLikeDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      index: true,
    },
  },
  { timestamps: true }
);

CommentLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const CommentLike = mongoose.model<CommentLikeDocument>(
  "CommentLike",
  CommentLikeSchema
);
