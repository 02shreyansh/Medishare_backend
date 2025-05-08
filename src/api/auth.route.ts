import express, { NextFunction, Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { AuthRepository } from "../repository/auth.repository";
import { SigninRequest, SignupRequest } from "../dto/auth.dto";
import { RequestValidator } from "../utils/requestValidator";
import { AccessTokenOptions, RefreshTokenOptions } from "../utils";
import Authenticate from "../middleware/authenticate";
const router = express.Router();

export const authService = new AuthService(new AuthRepository());
router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { errors, input } = await RequestValidator(SignupRequest, req.body);
      if (errors) {
        res.status(400).json(errors);
        return;
      }
      const { user: data, tokens } = await authService.createUser(input);
      res.cookie("accessToken", tokens.accessToken, AccessTokenOptions);
      res.cookie("refreshToken", tokens.refreshToken, RefreshTokenOptions);

      res.status(201).json({
        message: "User created successfully",
        success: true,
        data: {
          id: data?.id,
          full_name: data?.full_name,
          email: data?.email,
          phone_number: data?.phone_number,
          role: data?.role,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  }
);
router.post("/signin", async (req: Request, res: Response, next: Function) => {
  try {
    const { errors, input } = await RequestValidator(SigninRequest, req.body);
    if (errors) {
      res.status(400).json(errors);
      return;
    }
    const result = await authService.loginUser(input);
    if (!result) {
      res.status(500).json({ message: "Login failed. Please try again." });
      return;
    }
    const { user: data, tokens } = result;
    res.cookie("accessToken", tokens.accessToken, AccessTokenOptions);
    res.cookie("refreshToken", tokens.refreshToken, RefreshTokenOptions);
    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      data: {
        id: data?.id,
        full_name: data?.full_name,
        email: data?.email,
        phone_number: data?.phone_number,
        role: data?.role,
      },
    });
  } catch (error) {
    next(error);
    return;
  }
});
router.get(
  "/getUserProfile",
  Authenticate,
  async (req: Request, res: Response, next: Function) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      res.status(200).json({
        message: "User profile fetched successfully",
        success: true,
        data: {
          full_name: user.full_name,
          email: user.email,
          phoneNumber: user.phone_number,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  }
);
router.post(
  "/logout",
  Authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
      await authService.logoutUser(req.user.id);
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res
        .status(200)
        .json({ message: "Logged out successfully", success: true });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
