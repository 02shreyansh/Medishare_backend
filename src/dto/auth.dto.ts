import { IsNotEmpty, IsString } from "class-validator";
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
}
export class SigninRequest{
    @IsString()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    password:string;
}