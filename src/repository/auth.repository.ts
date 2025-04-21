import { PrismaClient } from "@prisma/client";
import { IAuthRepository } from "../interface/auth.interface";
import { Signup, AuthResponse, Signin } from "../model/auth.model";

export class AuthRepository implements IAuthRepository {
  _prisma: PrismaClient;
  constructor() {
    this._prisma = new PrismaClient();
  }
  signup(data: Signup): Promise<AuthResponse> {
    return this._prisma.user.create({
      data
    })
  }
  signin(data: Signin): Promise<void> {
    throw new Error("Method not implemented.");
  }
  validate(token: string): Promise<AuthResponse> {
    throw new Error("Method not implemented.");
  }
}
