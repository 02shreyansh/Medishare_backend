import "dotenv/config";
export const Connect = {
  PORT: process.env.PORT!,
  DATABASE_URL:process.env.DATABASE_URL!,
  REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET as string,
  REFRESH_TOKEN_EXPIRY:process.env.REFRESH_TOKEN_EXPIRY as string,
  ACCESS_TOKEN_SECRET:process.env.ACCESS_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRY:process.env.ACCESS_TOKEN_EXPIRY as string,
};
