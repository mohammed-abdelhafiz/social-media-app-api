import mongoose from "mongoose";

export interface getUserPostsArgs {
    username: string;
    page: number;
    limit: number;
    filter?: string;
    authenticatedUserId: mongoose.Types.ObjectId;
}