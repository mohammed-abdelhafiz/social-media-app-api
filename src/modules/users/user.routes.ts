import { Router } from "express";
import * as usersController from "./user.controller";
import {
  authenticate,
  authorizeProfileOwner,
} from "../../shared/middlewares/auth.middleware";
import upload from "../../shared/config/multer.config";

const router = Router();

router.get(
  "/followSuggestions",
  authenticate,
  usersController.getFollowSuggestions
);

router.route("/:username").get(usersController.getUserProfile);

router
  .route("/:userId")
  .put(
    authenticate,
    authorizeProfileOwner,
    upload.single("profilePicture"),
    usersController.updateUserProfile
  )
  .delete(
    authenticate,
    authorizeProfileOwner,
    usersController.deleteUserProfile
  );

router.get("/:username/followers", usersController.getUserFollowers);
router.get("/:username/following", usersController.getUserFollowings);
router.get("/:username/posts", usersController.getUserPosts);

router
  .route("/:username/follow")
  .post(authenticate, usersController.followUser)
  .delete(authenticate, usersController.unfollowUser);

export default router;
