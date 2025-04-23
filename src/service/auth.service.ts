import { IAuthRepository } from "../interface/auth.interface";
import { Signup } from "../model/auth.model";
import {
  APIError,
  GeneratePassword,
  GenerateSalt,
  NotFoundError,
} from "../utils";

export class AuthService {
  private _repository: IAuthRepository;
  constructor(repository: IAuthRepository) {
    this._repository = repository;
  }
  async createUser(input: Signup) {
    console.log("input", input);
    try {
      const existingCustomer = await this._repository.FindCustomer({
        email: input.email,
      });
      if (existingCustomer) {
        throw new APIError("User already exists");
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
    } catch (error) {
      throw new APIError("Invalid data");
    }
  }
}
