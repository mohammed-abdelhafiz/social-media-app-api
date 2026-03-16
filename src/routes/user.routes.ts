import { Router } from "express";
import usersController from "../controllers/user.controller";
import authorizeProfileOwner from "../middlewares/authorizeProfileOwner";
import authenticate from "../middlewares/authenticate";

const router = Router();

router.get("/", usersController.getAllUsers);

router
  .route("/:username")
  .get(usersController.getUser)
  .put(authenticate, authorizeProfileOwner, usersController.updateUserProfile)
  .delete(
    authenticate,
    authorizeProfileOwner,
    usersController.deleteUserAccount
  );

export default router;
