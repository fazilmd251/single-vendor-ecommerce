import { RegisterDto } from "../../interfaces/auth/Auth";
import { ValidationError } from "../../utils/errors/errors";

export const validateRegisterInput = (data: RegisterDto) => {
    if (!data||!data.email) throw new ValidationError("Email is required");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email))
        throw new ValidationError("provide a valid email")
} 

