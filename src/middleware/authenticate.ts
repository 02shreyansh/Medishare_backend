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
      await attemptTokenRefresh(req, res, next);
      return;
    }
    const decoded = VerifyAccessToken(accessToken) as User | null;
    if (!decoded) {
      await attemptTokenRefresh(req, res, next);
      return;
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
      throw new AuthorizeError("User is not authenticated") // 403
    }else if(error instanceof NotFoundError){
      throw new NotFoundError("User not found") // 404
    }else if(error instanceof APIError){
      throw new APIError("Invalid access token") //500
    }
    throw new APIError("Something went wrong while authenticating user")
  }
};
async function attemptTokenRefresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new AuthorizeError("User is not authenticated");
    }
    const tokens = await authService.refreshTokens(refreshToken);
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 
    });
    
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    const decoded = VerifyAccessToken(tokens.accessToken) as User | null;
    
    if (!decoded) {
      throw new APIError("Failed to verify new access token");
    }
    
    const user = await authService.validateUser(decoded.email);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }
    
    const mergedUser: User = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role
    };
    
    req.user = mergedUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
}

export default Authenticate;
