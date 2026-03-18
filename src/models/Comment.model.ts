import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: { type: String, required: true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    likedByCurrentUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

export default Comment;
