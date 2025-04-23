import { IAuthRepository } from "../interface/auth.interface";
import { DB } from "../db/db.connection";
import { Signup } from "../model/auth.model";
import { User, users } from "../db/schema";
import { NotFoundError} from "../utils";

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
    if (!existingCustomer) {
      throw new NotFoundError("User not found");
    }
    return existingCustomer;
  }
}
