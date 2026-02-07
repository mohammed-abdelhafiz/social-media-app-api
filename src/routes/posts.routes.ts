import { Router } from "express";
import postsController from "../controllers/posts.controller";
import authenticate from "../middlewares/authenticate";
import authorizePostOwner from "../middlewares/authorizePostOwner";
import commentsRoutes from "./comments.routes";

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
router.use("/:postId/comments", commentsRoutes);

export default router;
