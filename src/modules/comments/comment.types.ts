import mongoose from "mongoose";

export interface GetPostCommentsParams {
  postId: mongoose.Types.ObjectId;
  page: number;
  limit: number;
  authenticatedUserId: mongoose.Types.ObjectId;
}
