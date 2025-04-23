import { IAuthRepository } from "../interface/auth.interface";
import { DB } from "../db/db.connection";
import { Signup } from "../model/auth.model";
import { User, users } from "../db/schema";
import { eq } from "drizzle-orm";

export class AuthRepository implements IAuthRepository {
  _db: typeof DB;
  constructor() {
    this._db = DB;
  }
  async signup(data: Signup): Promise<User> {
    const [newUser] = await this._db.insert(users).values(data).returning();
    return newUser;
  }
  async FindCustomer({ email }: { email: string }): Promise<User> {
    const existingCustomer = await this._db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    return existingCustomer as User;
  }
  async FindUserByPhoneNumber({
    phone_number,
  }: {
    phone_number: string;
  }): Promise<Boolean> {
    const existingCustomer = await this._db.select({phone_number:users.phone_number}).from(users).where(eq(users.phone_number,phone_number)).limit(1);
    console.log(existingCustomer);
    return existingCustomer.length > 0
  }
}
