import { Router } from "express";
import * as controller from "./comment.controller";
import {authenticate} from "../../shared/middlewares/auth.middleware";

const router = Router();

router
  .route("/")
  .get(controller.getPostComments)
  .post(authenticate, controller.createComment);

router
  .route("/:commentId")
  .put(authenticate, controller.updateComment)
  .delete(authenticate, controller.deleteComment);


router
  .route("/:commentId/likes")
  .get(controller.getCommentLikes)
  .post(authenticate, controller.likeComment)
  .delete(authenticate, controller.unlikeComment);

export default router;
