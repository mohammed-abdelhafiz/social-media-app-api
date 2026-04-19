import mongoose from "mongoose";
import AppError from "@/shared/utils/AppError";
import { PostContent } from "./post.types";

export interface PostDocument extends mongoose.Document {
  author: mongoose.Types.ObjectId;
  content: PostContent;
  likesCount: number;
  commentsCount: number;
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
        text: { type: String, maxLength: 2000, trim: true },
        image: { type: { url: String, publicId: String } },
      },
      required: true,
    },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PostSchema.methods.toJSON = function () {
  const post = this.toObject();
  delete post.__v;
  return post;
};

PostSchema.pre("validate", function () {
  if (!this.content.text && !this.content.image?.url) {
    throw new AppError("Post must have text or image", 400);
  }
});

PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model("Post", PostSchema);

export default Post;
