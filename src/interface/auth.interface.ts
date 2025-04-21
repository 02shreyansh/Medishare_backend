import { AuthResponse,Signup,Signin } from "../model/auth.model";

export interface IAuthRepository{
    signup(data:Signup): Promise<AuthResponse>;
    signin(data:Signin): Promise<void>;
    validate(token:string):Promise<AuthResponse>;
}