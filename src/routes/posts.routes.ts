import { Router } from "express";
import postsController from "../controllers/posts.controller";
import authenticate from "../middlewares/authenticate";

const router = Router();

//routes

/**
 * @route GET /api/posts
 * @desc Get all posts
 * @access Public
 */
router.get("/", postsController.getAllPosts);

/**
 * @route GET /api/posts/:id
 * @desc Get a post by ID
 * @access Public
 */
router.get("/:id", postsController.getPostById);

/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private (Requires authentication)
 */
router.post("/", authenticate, postsController.createPost);

/**
 * @route PUT /api/posts/:id
 * @desc Update a post
 * @access Private (Requires authentication and ownership)
 */
router.put("/:id", authenticate, postsController.updatePost);

/**
 * @route DELETE /api/posts/:id
 * @desc Delete a post
 * @access Private (Requires authentication and ownership)
 */
router.delete("/:id", authenticate, postsController.deletePost);

/**
 * @route POST /api/posts/:id/like
 * @desc Like a post
 * @access Private (Requires authentication)
 */
router.post("/:id/like", authenticate, postsController.likePost);

/**
 * @route POST /api/posts/:id/share
 * @desc Share a post
 * @access Private (Requires authentication)
 */
router.post("/:id/share", authenticate, postsController.sharePost);

export default router;
