import { IAuthRepository } from "../interface/auth.interface";
import { Signin, Signup } from "../model/auth.model";
import jwt from "jsonwebtoken";
import {
  APIError,
  AuthorizeError,
  GenerateAccessToken,
  GeneratePassword,
  GenerateRefreshToken,
  GenerateSalt,
  NotFoundError,
  ValidatePassword,
  ValidationError,
  VerifyRefreshToken,
} from "../utils";
import { Connect } from "../config/connect";

export class AuthService {
  private _repository: IAuthRepository;
  constructor(repository: IAuthRepository) {
    this._repository = repository;
  }
  async createUser(input: Signup) {
    try {
      const existingCustomer = await this._repository.FindCustomer({
        email: input.email,
      });
      if (existingCustomer) {
        throw new ValidationError("Email already exists");
      }
      const phoneNumberExists = await this._repository.FindUserByPhoneNumber({
        phone_number: input.phone_number,
      });
      if (phoneNumberExists) {
        throw new ValidationError("Phone number already exists");
      }

      const salt = await GenerateSalt();
      const userPassword = await GeneratePassword(input.password, salt);
      const data = await this._repository.signup({
        ...input,
        password: userPassword,
      });
      if (!data.id) {
        throw new NotFoundError("User not created");
      }
      const accessToken = await GenerateAccessToken({
        id: data.id,
        email: data.email,
      });
      if (typeof accessToken !== "string") {
        throw new APIError("Failed to generate access token");
      }
      const refreshToken = await GenerateRefreshToken({
        id: data.id,
        email: data.email,
      });
      if (typeof refreshToken !== "string") {
        throw new APIError("Failed to generate refresh token");
      }
      await this._repository.UpdateRefreshToken(data.id, refreshToken);
      data.refresh_token = refreshToken;
      return {
        user: data,
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof APIError
      ) {
        throw error;
      }
      throw new APIError("Failed to create user");
    }
  }
  async loginUser(input: Signin) {
    try {
      const existingCustomer = await this._repository.FindCustomer({
        email: input.email,
      });
      if (!existingCustomer) {
        throw new NotFoundError("User not found");
      }

      const isPasswordValid = await ValidatePassword(
        input.password,
        existingCustomer.password
      );
      if (!isPasswordValid) {
        throw new ValidationError("Invalid password");
      }
      const accessToken = await GenerateAccessToken({
        id: existingCustomer.id,
        email: existingCustomer.email,
      });
      if (typeof accessToken !== "string") {
        throw new APIError("Failed to generate access token");
      }
      const refreshToken = await GenerateRefreshToken({
        id: existingCustomer.id,
        email: existingCustomer.email,
      });
      if (typeof refreshToken !== "string") {
        throw new APIError("Failed to generate refresh token");
      }
      await this._repository.UpdateRefreshToken(
        existingCustomer.id,
        refreshToken
      );
      existingCustomer.refresh_token = refreshToken;

      return {
        user: existingCustomer,
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof APIError
      ) {
        throw error;
      }
    }
  }
  async validateUser(email: string) {
    try {
      const existingCustomer = await this._repository.FindCustomer({
        email: email,
      });
      if (!existingCustomer) {
        throw new NotFoundError("User not found");
      }
      return existingCustomer;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError("User not found");
      }
      throw new APIError("Something went wrong while validating user");
    }
  }
  async refreshTokens(refreshToken: string) {
    try {
      const decoded = await VerifyRefreshToken(refreshToken) as any;
      if (!decoded) {
        throw new AuthorizeError("Invalid refresh token");
      }
      const user = await this._repository.FindCustomer({
        email: decoded.email,
      });
      if (!user) {
        throw new NotFoundError("User not found");
      }
      if (user.refresh_token !== refreshToken) {
        throw new AuthorizeError("Invalid refresh token");
      }
      const expiresAt = new Date(decoded.expiresAt);
      if (new Date() > expiresAt) {
        throw new AuthorizeError("Refresh token expired");
      }
      const accessToken = await GenerateAccessToken({
        id: user.id,
        email: user.email,
      });
      if (typeof accessToken !== "string") {
        throw new APIError("Failed to generate access token");
      }
      const newRefreshToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          tokenFamily: decoded.tokenFamily,
          expiresAt: decoded.expiresAt,
        },
        Connect.REFRESH_PRIVATE_KEY,
        {
          expiresIn:
            Connect.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
          algorithm: "ES256",
        }
      );
      if (typeof newRefreshToken !== "string") {
        throw new APIError("Failed to generate refresh token");
      }
      
      await this._repository.UpdateRefreshToken(user.id, newRefreshToken);
      user.refresh_token = newRefreshToken;

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof AuthorizeError) {
        throw error;
      }
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new APIError("Failed to refresh tokens");
    }
  }
  async logoutUser(userId: number) {
    try {
      await this._repository.UpdateRefreshToken(userId, null);
      return true;
    } catch (error) {
      throw new APIError("Failed to logout user");
    }
  }
}
