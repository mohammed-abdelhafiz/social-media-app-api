import { Router } from "express";
import postsController from "../controllers/posts.controller";
import authenticate from "../middlewares/authenticate";
import authorizePostOwner from "../middlewares/authorizePostOwner";
import authorizeCommentOwner from "../middlewares/authorizeCommentOwner";

const router = Router();

// =======================
// POSTS ROUTES
// =======================

/**
 * @route GET /api/posts
 * @desc Get all posts
 * @access Public
 */
router.get("/", postsController.getAllPosts);

/**
 * @route GET /api/posts/:postId
 * @desc Get a post by ID
 * @access Public
 */
router.get("/:postId", postsController.getPostById);

/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private (Requires authentication)
 */
router.post("/", authenticate, postsController.createPost);

/**
 * @route PUT /api/posts/:postId
 * @desc Update a post
 * @access Private (Requires authentication and ownership)
 */
router.put(
  "/:postId",
  authenticate,
  authorizePostOwner,
  postsController.updatePost
);

/**
 * @route DELETE /api/posts/:postId
 * @desc Delete a post
 * @access Private (Requires authentication and ownership)
 */
router.delete(
  "/:postId",
  authenticate,
  authorizePostOwner,
  postsController.deletePost
);

/**
 * @route POST /api/posts/:postId/like
 * @desc Like a post
 * @access Private (Requires authentication)
 */
router.post("/:postId/like", authenticate, postsController.likePost);

// =======================
// COMMENTS ROUTES
// =======================

/**
 * @route GET /api/posts/:postId/comments
 * @desc Get comments of a post
 * @access Public
 */
router.get("/:postId/comments", postsController.getPostComments);

/**
 * @route POST /api/posts/:postId/comments
 * @desc Add a comment to a post
 * @access Private (Requires authentication)
 */
router.post("/:postId/comments", authenticate, postsController.createComment);

/**
 * @route PUT /api/posts/:postId/comments/:commentId
 * @desc Update a comment
 * @access Private (Requires authentication and ownership)
 */
router.put(
  "/:postId/comments/:commentId",
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
  "/:postId/comments/:commentId",
  authenticate,
  authorizeCommentOwner,
  postsController.deleteComment
);

export default router;
