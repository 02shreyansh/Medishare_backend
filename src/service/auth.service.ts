import { IAuthRepository } from "../interface/auth.interface";
import { Signin, Signup } from "../model/auth.model";
import {
  APIError,
  GenerateAccessToken,
  GeneratePassword,
  GenerateRefreshToken,
  GenerateSalt,
  NotFoundError,
  ValidatePassword,
  ValidationError,
} from "../utils";

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
          refreshToken 
        }
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof APIError) {
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
      await this._repository.UpdateRefreshToken(existingCustomer.id, refreshToken);
      existingCustomer.refresh_token = refreshToken;
      
      return {
        user: existingCustomer,
        tokens: {
          accessToken,
          refreshToken 
        }
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof APIError) {
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
}
