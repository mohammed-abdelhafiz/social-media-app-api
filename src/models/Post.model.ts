import mongoose from "mongoose";
import { PostContent } from "../types/utilTypes";

export interface PostDocument extends mongoose.Document {
  author: mongoose.Types.ObjectId;
  content: PostContent;
  comments: mongoose.Types.ObjectId[];
  likedBy: mongoose.Types.ObjectId[];
  commentsCount: number;
  likesCount: number;
  likedByCurrentUser: boolean;
}

const PostSchema = new mongoose.Schema<PostDocument>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: {
        text: { type: String },
        image: {
          type: {
            url: String,
            publicId: String,
          },
        },
      },
      required: true,
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    commentsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    likedByCurrentUser: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PostSchema.methods.toJSON = function () {
  const post = this.toObject({ virtuals: true });
  delete post.__v;
  return post;
};

PostSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", PostSchema);

export default Post;
