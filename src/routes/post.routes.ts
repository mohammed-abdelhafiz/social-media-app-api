import { Router } from "express";
import postsController from "../controllers/post.controller";
import authenticate from "../middlewares/authenticate";
import authorizePostOwner from "../middlewares/authorizePostOwner";
import { upload } from "../middlewares/upload";

const router = Router();

router
  .route("/")
  .get(authenticate,postsController.getPosts)
  .post(authenticate, upload.single("image"), postsController.createPost);

router
  .route("/:postId")
  .get(postsController.getPostById)
  .put(authenticate, authorizePostOwner,upload.single("image"), postsController.updatePost)
  .delete(authenticate, authorizePostOwner, postsController.deletePost);

router.route("/:postId/like").post(authenticate, postsController.likePost);

router
  .route("/:postId/comments")
  .get(postsController.getPostComments)
  .post(authenticate, postsController.createComment);
router.route("/:postId/likes").get(postsController.getPostLikes);
export default router;
