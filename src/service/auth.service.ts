import { IAuthRepository } from "../interface/auth.interface";
import { Signin, Signup } from "../model/auth.model";
import {
  APIError,
  GeneratePassword,
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
      const phoneNumberExists = await this._repository.FindUserByPhoneNumber({
        phone_number: input.phone_number,
      });
      
      if (!existingCustomer || !phoneNumberExists) {
        const salt = await GenerateSalt();
        const userPassword = await GeneratePassword(input.password, salt);
        const data = await this._repository.signup({
          ...input,
          password: userPassword,
        });
        if (!data.id) {
          throw new NotFoundError("User not created");
        }
        return data;
      }
    } catch (error) {
      throw new ValidationError("Email or phone number already exists");
    }
  }
  async loginUser(input: Signin) {
    try {
      const existingCustomer = await this._repository.FindCustomer({
        email: input.email,
      });
      if (!existingCustomer) {
        throw new NotFoundError();
      }
      if (existingCustomer) {
        const isPasswordValid = await ValidatePassword(
          input.password,
          existingCustomer.password
        );
        if (!isPasswordValid) {
          throw new ValidationError();
        }
        return existingCustomer;
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new APIError("Invalid password");
      }else{
        throw new NotFoundError("User not found");
      }
    }
  }
  async validateUser (email:string){
    try {
      const existingCustomer=await this._repository.FindCustomer({
        email:email
      });
      if(!existingCustomer){
        throw new NotFoundError("User not found")
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