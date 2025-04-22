import bcrypt from "bcrypt";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { Connect } from "../../config/connect";
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export interface User {
  id: number;
  email: string;
  iat: number;
  exp: number;
}
interface PayloadData {
  id: number;
  email: string;
}
const REFRESH_TOKEN_SECRET = Connect.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = Connect.REFRESH_TOKEN_EXPIRY;
export const GenerateSalt = async () => {
  return await bcrypt.genSalt(12);
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateRefreshToken = async (payload: PayloadData) => {
  try {
    return jwt.sign(payload, Connect.REFRESH_TOKEN_SECRET  as jwt.Secret,{
        expiresIn: Connect.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
        algorithm: "HS256",
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

// export const ValidateSignature = async (req: Request) => {
//   try {
//     const signature = req.cookies.token as string;
//     const payload = jwt.verify(signature, envValues.APP_SECRET) as User;
//     req.user = payload;
//     return true;
//   } catch (error) {
//     console.log(error);
//     return false;
//   }
// };

// // Generate access token
// export const generateAccessToken = (userId) => {
//   return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
//     expiresIn: ACCESS_TOKEN_EXPIRY,
//   });
// };

// // Generate refresh token
// export const generateRefreshToken = (userId) => {
//   return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
//     expiresIn: REFRESH_TOKEN_EXPIRY,
//   });
// };

// // Verify access token
// export const verifyAccessToken = (token) => {
//   try {
//     return jwt.verify(token, ACCESS_TOKEN_SECRET);
//   } catch (error) {
//     return null;
//   }
// };

// // Verify refresh token
// export const verifyRefreshToken = (token) => {
//   try {
//     return jwt.verify(token, REFRESH_TOKEN_SECRET);
//   } catch (error) {
//     return null;
//   }
// };
