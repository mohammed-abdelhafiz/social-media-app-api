import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  shares: { type: Number, default: 0 },
});

PostSchema.methods.toJSON = function () {
  const post = this.toObject();
  delete post.__v;
  return post;
};

const Post = mongoose.model("Post", PostSchema);

export default Post;
