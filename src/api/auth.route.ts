import express, { NextFunction, Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { AuthRepository } from "../repository/auth.repository";
import { SignupRequest } from "../dto/auth.dto";
import { RequestValidator } from "../utils/requestValidator";
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
      const data = await authService.createUser(input);
      res.status(201).json({
        message: "User created successfully",
        data: {
          id: data?.id,
          full_name: data?.full_name,
          email: data?.email,
          phone_number: data?.phone_number,
          role: data?.role,
          created_at: data?.created_at,
          updated_at: data?.updated_at,
          refresh_token: data?.refresh_token,
        },
      });
    } catch (error) {
      next(error);
      return;
    }
  }
);
router.get("/test", (req, res) => {
  res.json({ message: "Server is working" });
});

export default router;
