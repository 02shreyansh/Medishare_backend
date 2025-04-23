import "dotenv/config";
import { Secret } from "jsonwebtoken";

export const Connect = {
  PORT: process.env.PORT!,
  DATABASE_URL:process.env.DATABASE_URL!,
  ACCESS_PRIVATE_KEY:process.env.ACCESS_PRIVATE_KEY?.replace(/\\n/g, '\n') as Secret,
  ACCESS_PUBLIC_KEY: process.env.ACCESS_PUBLIC_KEY?.replace(/\\n/g, '\n') as Secret,

  REFRESH_PRIVATE_KEY: process.env.REFRESH_PRIVATE_KEY?.replace(/\\n/g, '\n') as Secret,
  REFRESH_PUBLIC_KEY: process.env.REFRESH_PUBLIC_KEY?.replace(/\\n/g, '\n') as Secret,

  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as string,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as string,
};