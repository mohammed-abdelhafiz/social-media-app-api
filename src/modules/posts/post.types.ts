import mongoose from "mongoose";

export interface PostImage {
  url: string;
  publicId: string;
}

export interface PostContent {
  text?: string;
  image?: { url: string; publicId: string };
  removeOldImage?: boolean;
}

export interface GetFeedPostsParams {
  page: number;
  limit: number;
  filter?: string;
  authenticatedUserId: mongoose.Types.ObjectId;
}
