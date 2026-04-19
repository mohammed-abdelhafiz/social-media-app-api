import { Router } from "express";
import * as postsController from "./post.controller";
import {
  authorizePostOwner,
  authenticate,
} from "@/shared/middlewares/auth.middleware";
import upload from "@/shared/config/multer.config";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.single("image"),
  postsController.createPost
);

router.get("/feed", authenticate, postsController.getFeedPosts);

router
  .route("/:postId")
  .get(postsController.getPostById)
  .put(
    authenticate,
    authorizePostOwner,
    upload.single("image"),
    postsController.updatePost
  )
  .delete(authenticate, authorizePostOwner, postsController.deletePost);

router
  .route("/:postId/likes")
  .get(postsController.getPostLikes)
  .post(authenticate, postsController.likePost)
  .delete(authenticate, postsController.unlikePost);

export default router;
