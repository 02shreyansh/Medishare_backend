import express, { NextFunction, Request, Response } from "express";
import { AuthService } from "../service/auth.service";
import { AuthRepository } from "../repository/auth.repository";
import { SigninRequest, SignupRequest } from "../dto/auth.dto";
import { RequestValidator } from "../utils/requestValidator";
import { AccessTokenOptions, RefreshTokenOptions } from "../utils";
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
      const {user:data , tokens} = await authService.createUser(input);
      res.cookie("accessToken",tokens.accessToken,AccessTokenOptions);
      res.cookie("refreshToken",tokens.refreshToken,RefreshTokenOptions);

      res.status(201).json({
        message: "User created successfully",
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
router.post(
  "/signin",
  async (req:Request,res:Response,next:Function)=>{
    try {
      const {errors,input} = await RequestValidator(SigninRequest,req.body);
      if(errors){
        res.status(400).json(errors);
        return;
      }
      const data=await authService.loginUser(input);
      res.status(200).json({
        message:"User logged in successfully",
        data:{
          id:data?.id,
          full_name:data?.full_name,
          email:data?.email,
          phone_number:data?.phone_number,
          role:data?.role,
        }
      })
    } catch (error) {
      next(error);
      return;
    }
  }
)
router.get("/test", (req, res) => {
  res.json({ message: "Server is working" });
});

export default router;
