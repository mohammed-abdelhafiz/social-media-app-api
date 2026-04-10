import { Router } from "express";

import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/users/user.routes";
import postRouter from "./modules/posts/post.routes";
import commentRouter from "./modules/comments/comment.routes";
import notificationRouter from "./modules/notifications/notification.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/posts/:postId/comments", commentRouter);
router.use("/notifications", notificationRouter);

export default router;
