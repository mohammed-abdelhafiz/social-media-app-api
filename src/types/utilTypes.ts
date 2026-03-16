import mongoose from "mongoose";

export interface JwtPayload {
  userId: mongoose.Types.ObjectId;
}

export interface PostImage {
  url: string;
  publicId: string;
}

export interface PostContent {
  text: string;
  image: PostImage | null;
  removeOldImage?: string;
}
