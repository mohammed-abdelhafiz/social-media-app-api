import { Router } from "express";
import postsController from "../controllers/posts.controller";
import authenticate from "../middlewares/authenticate";
import authorizeCommentOwner from "../middlewares/authorizeCommentOwner";

const router = Router();

/**
 * @route GET /api/posts/:postId/comments
 * @desc Get comments of a post
 * @access Public
 */
router.get("/", postsController.getPostComments);

/**
 * @route POST /api/posts/:postId/comments
 * @desc Add a comment to a post
 * @access Private (Requires authentication)
 */
router.post("/", authenticate, postsController.createComment);

/**
 * @route PUT /api/posts/:postId/comments/:commentId
 * @desc Update a comment
 * @access Private (Requires authentication and ownership)
 */
router.put(
  "/:commentId",
  authenticate,
  authorizeCommentOwner,
  postsController.updateComment
);

/**
 * @route DELETE /api/posts/:postId/comments/:commentId
 * @desc Delete a comment
 * @access Private (Requires authentication and ownership)
 */
router.delete(
  "/:commentId",
  authenticate,
  authorizeCommentOwner,
  postsController.deleteComment
);

export default router;
