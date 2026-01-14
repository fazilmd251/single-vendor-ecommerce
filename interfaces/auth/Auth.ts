export interface RegisterDto{
    email:string;
}

export interface VerifyUser{
    email:string;
    otp:string;
    password:string;
    name:string
}