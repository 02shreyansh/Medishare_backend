import bcrypt from "bcrypt";
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
export const GenerateSalt = async () => {
  return await bcrypt.genSalt(12);
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

export const GenerateRefreshToken = async (payload: PayloadData) => {
  try {
    return jwt.sign(payload, Connect.REFRESH_PRIVATE_KEY, {
      expiresIn: Connect.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
      algorithm: "ES256",
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const GenerateAccessToken = async (payload: PayloadData) => {
  try {
    return jwt.sign(payload, Connect.ACCESS_PRIVATE_KEY, {
      expiresIn: Connect.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
      algorithm: "ES256",
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const VerifyRefreshToken=async (token:string)=>{
  try{
    return jwt.verify(token,Connect.REFRESH_PUBLIC_KEY,{
      algorithms:["ES256"]
    });
  }catch(error){
    console.log(error);
    return null;
  }
}

export const VerifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, Connect.ACCESS_PUBLIC_KEY, { 
      algorithms: ['ES256'] 
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};