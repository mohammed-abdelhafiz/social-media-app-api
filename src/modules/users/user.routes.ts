import { Router } from "express";
import * as usersController from "./user.controller";
import {
  authenticate,
  optionalAuthenticate,
  authorizeProfileOwner,
} from "@/shared/middlewares/auth.middleware";
import upload from "@/shared/config/multer.config";

const router = Router();

router.get(
  "/followSuggestions",
  authenticate,
  usersController.getFollowSuggestions
);

router.route("/:username").get(optionalAuthenticate, usersController.getUserProfile);

router
  .route("/:userId")
  .put(
    authenticate,
    authorizeProfileOwner,
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ]),
    usersController.updateUserProfile
  )
  .delete(
    authenticate,
    authorizeProfileOwner,
    usersController.deleteUserProfile
  );

router.get("/:username/followers", usersController.getUserFollowers);
router.get("/:username/followings", usersController.getUserFollowings);
router.get("/:username/posts",authenticate, usersController.getUserPosts);

router
  .route("/:username/follow")
  .post(authenticate, usersController.followUser)
  .delete(authenticate, usersController.unfollowUser);

export default router;
