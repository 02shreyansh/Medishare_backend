import { IAuthRepository } from "../interface/auth.interface";
import { DB } from "../db/db.connection";
import { Signup, AuthResponse, Signin } from "../model/auth.model";
import { User, users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { NotFoundError } from "../utils";

export class AuthRepository implements IAuthRepository {
  _db: typeof DB;
  constructor() {
    this._db = DB;
  }
  async signup(data: Signup): Promise<User> {
    const [newUser] = await this._db.insert(users).values(data).returning();
    return newUser;
  }
  async signin(data: Signin): Promise<User> {
    const [user] = await this._db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if(!user){
      throw new NotFoundError("User not found");
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    return user;
  }
  validate(token: string): Promise<User> {
    throw new Error("Method not implemented.");
  }
}
