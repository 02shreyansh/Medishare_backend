import { NextFunction, Request, Response } from "express";
import { APIError, AuthorizeError, NotFoundError, VerifyAccessToken } from "../utils";
import { authService } from "../api/auth.route";
interface User{
  id:number;
  full_name:string;
  email:string;
  phone_number:string;
  role:"user"|"admin";
}
declare global{
  namespace Express {
    interface Request {
      user?:User;
    }
  }
}
const Authenticate = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken as string;
    if (!accessToken) {
      throw new AuthorizeError("User is not authenticated")
    }
    const decoded = VerifyAccessToken(accessToken) as User | null;
    if (!decoded) {
      throw new APIError("Invalid access token")
    }
    const user = await authService.validateUser(decoded.email);
    if (!user) {
      throw new NotFoundError("User not found")
    }
    const mergedUser: User = {
      id:user.id,
      full_name:user.full_name,
      email:user.email,
      phone_number:user.phone_number,
      role:user.role
    };
    req.user=mergedUser;
    next();
  } catch (error) {
    if(error instanceof AuthorizeError){
      throw new AuthorizeError("User is not authenticated")
    }else if(error instanceof NotFoundError){
      throw new NotFoundError("User not found")
    }else if(error instanceof APIError){
      throw new APIError("Invalid access token")
    }
    throw new APIError("Something went wrong while authenticating user")
  }
};

export default Authenticate;
