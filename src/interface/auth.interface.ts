import { User } from "../db/schema";
import { Signup,Signin } from "../model/auth.model";

export interface IAuthRepository{
    signup(data:Signup): Promise<User>;
    signin(data:Signin): Promise<User>;
    validate(token:string):Promise<User>;
}