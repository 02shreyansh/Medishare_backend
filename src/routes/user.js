import express from "express";
import {
  signup,
  signin,
  validateUser,
  refreshToken,
  logout,
} from "../controller/Controller.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Protected routes
router.get("/validate", authenticate, validateUser);

export default router;
