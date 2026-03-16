import mongoose from "mongoose";
import { PostContent } from "../types/utilTypes";

export interface PostDocument extends mongoose.Document {
  author: mongoose.Types.ObjectId;
  content: PostContent;
  comments: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
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
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

PostSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

PostSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

PostSchema.methods.toJSON = function () {
  const post = this.toObject({ virtuals: true });
  delete post.__v;
  return post;
};

PostSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", PostSchema);

export default Post;
