import { IsNotEmpty, IsString } from "class-validator";

export interface Status {
    role: 'user' | 'admin';
}
export class SignupRequest{
    @IsString()
    @IsNotEmpty()
    full_name:string;

    @IsString()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    phone_number:string;

    @IsString()
    @IsNotEmpty()
    password:string;

    @IsString()
    role?:Status['role'];
}
export class SigninRequest{
    @IsString()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    password:string;
}