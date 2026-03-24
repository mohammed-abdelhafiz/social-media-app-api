import mongoose from "mongoose";

interface CommentDocument extends mongoose.Document {
  author: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content: string;
  likesCount: number;
}

const CommentSchema = new mongoose.Schema<CommentDocument>(
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
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Comment = mongoose.model<CommentDocument>("Comment", CommentSchema);

export default Comment;
