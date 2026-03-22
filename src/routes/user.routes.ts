import { Router } from "express";
import usersController from "../controllers/user.controller";
import authorizeProfileOwner from "../middlewares/authorizeProfileOwner";
import authenticate from "../middlewares/authenticate";

const router = Router();

router.get(
  "/followSuggestions",
  authenticate,
  usersController.getFollowSuggestions
);

router
  .route("/:username")
  .get(usersController.getUserProfile)
  .put(authenticate, authorizeProfileOwner, usersController.updateUserProfile)
  .delete(
    authenticate,
    authorizeProfileOwner,
    usersController.deleteUserAccount
  );

router.get("/:username/followers", usersController.getUserFollowers);
router.get("/:username/following", usersController.getUserFollowing);

router.post("/:username/follow", authenticate, usersController.followUser);

export default router;
