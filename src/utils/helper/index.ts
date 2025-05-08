import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Connect } from "../../config/connect";
import "dotenv/config";
import { CookieOptions } from "express";
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
  savedPassword: string
) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

export const GenerateRefreshToken = async (payload: PayloadData) => {
  try {
    const refreshTokenId = uuidv4();
    const tokenFamily = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return jwt.sign(
      {
        ...payload,
        tokenId: refreshTokenId,
        tokenFamily: tokenFamily,
        expiresAt: expiresAt.getTime(),
      },
      Connect.REFRESH_PRIVATE_KEY,
      {
        expiresIn: Connect.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
        algorithm: "ES256",
      }
    );
  } catch (error) {
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
    return error;
  }
};

export const VerifyRefreshToken = async (token: string) => {
  try {
    return jwt.verify(token, Connect.REFRESH_PUBLIC_KEY, {
      algorithms: ["ES256"],
    });
  } catch (error) {
    return null;
  }
};

export const VerifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, Connect.ACCESS_PUBLIC_KEY, {
      algorithms: ["ES256"],
    });
  } catch (error) {
    return null;
  }
};

export const AccessTokenOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
} as CookieOptions;

export const RefreshTokenOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
} as CookieOptions;