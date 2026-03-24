import mongoose from "mongoose";

interface FollowDocument extends mongoose.Document {
    followerId: mongoose.Types.ObjectId;
    followingId: mongoose.Types.ObjectId;
}

const FollowSchema = new mongoose.Schema<FollowDocument>(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

FollowSchema.pre("save", function () {
  if (this.followerId.equals(this.followingId)) {
    throw new Error("You cannot follow yourself");
  }
});

export const Follow = mongoose.model<FollowDocument>("Follow", FollowSchema);