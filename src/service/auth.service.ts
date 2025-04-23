import { IAuthRepository } from "../interface/auth.interface";
import { Signup } from "../model/auth.model";
import {
  APIError,
  GeneratePassword,
  GenerateSalt,
  NotFoundError,
  ValidationError,
} from "../utils";

export class AuthService {
  private _repository: IAuthRepository;
  constructor(repository: IAuthRepository) {
    this._repository = repository;
  }
  async createUser(input: Signup) {
    const existingCustomer = await this._repository.FindCustomer({
      email: input.email,
    });
    if (existingCustomer) {
      throw new ValidationError("User already exists with this email");
    }
    const phoneNumberExists = await this._repository.FindUserByPhoneNumber({
      phone_number: input.phone_number,
    });

    if (phoneNumberExists) {
      throw new ValidationError("User already exists with this phone number");
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
    return data;
  }
}
