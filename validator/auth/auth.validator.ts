import { RegisterDto, VerifyUser } from "../../interfaces/auth/Auth";
import { ValidationError } from "../../utils/errors/errors";

export const validateRegisterInput = (data: RegisterDto) => {
    if (!data||!data.email) throw new ValidationError("Email is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email))
        throw new ValidationError("provide a valid email")
} 


export const validateVerifyUser=(data:VerifyUser)=>{
    if (!data||!data.email) throw new ValidationError("Email is required");
    if (!data||!data.name) throw new ValidationError("Name is required");
    if (!data||!data.otp) throw new ValidationError("OTP is required");
    if (!data||!data.password) throw new ValidationError("Password is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email))
        throw new ValidationError("provide a valid email")
}
