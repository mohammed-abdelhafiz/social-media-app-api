import { Router } from "express";
import commentsController from "../controllers/comment.controller";
import authenticate from "../middlewares/authenticate";
import authorizeCommentOwner from "../middlewares/authorizeCommentOwner";

const router = Router();

router
  .route("/:commentId")
  .put(authenticate, authorizeCommentOwner, commentsController.updateComment)
  .delete(
    authenticate,
    authorizeCommentOwner,
    commentsController.deleteComment
  );

router
  .route("/:commentId/likes")
  .get(commentsController.getCommentLikes)
  .post(authenticate, commentsController.likeComment);

export default router;
