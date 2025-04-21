import { Status } from "../dto/auth.dto";

export class Signup{
    constructor(
        public readonly full_name: string,
        public readonly email: string,
        public readonly phone_number: string,
        public readonly password:string,
        public readonly role?:Status['role'],
        public readonly id?: number
    ){}
}

export class Signin{
    constructor(
        public readonly email: string,
        public readonly password:string,
        public readonly role?:Status['role'],
        public readonly id?: number
    ){}
}

export class AuthResponse{
    constructor(
        public readonly full_name: string,
        public readonly email: string,
        public readonly phone_number: string,
        public readonly role?:Status['role'],
        public readonly id?: number,
    ){}
}