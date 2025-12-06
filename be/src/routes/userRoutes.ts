import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUserDetails,
  getCurrentUser,
  updatePassword,
} from "../controllers/UserController";
import { validate } from "../middlewares/validateResource";
import {
  signupSchema,
  loginSchema,
  updateUserSchema,
  updatePasswordSchema,
} from "../schema/userSchema";
import { verifyJWT } from "../middlewares/verifyJWT";

const router = Router();

router.post("/signup", validate(signupSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);

// Protected Routes
router.post("/logout", verifyJWT, logoutUser);
router.patch(
  "/update-details",
  verifyJWT,
  validate(updateUserSchema),
  updateUserDetails
);
router.get("/me", verifyJWT, getCurrentUser);
router.patch(
  "/update-password",
  verifyJWT,
  validate(updatePasswordSchema),
  updatePassword
);

export default router;
