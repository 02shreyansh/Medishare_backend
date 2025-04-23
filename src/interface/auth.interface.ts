import { User } from "../db/schema";
import { Signup,Signin } from "../model/auth.model";

export interface IAuthRepository{
    signup(data:Signup): Promise<User>;
    FindCustomer({ email }:{email:string}):Promise<User>
}