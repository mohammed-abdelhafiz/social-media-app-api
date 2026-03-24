import mongoose from "mongoose";

interface PostLikeDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
}

const PostLikeSchema = new mongoose.Schema<PostLikeDocument>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", index: true },
  },
  { timestamps: true }
);

PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const PostLike = mongoose.model<PostLikeDocument>(
  "PostLike",
  PostLikeSchema
);