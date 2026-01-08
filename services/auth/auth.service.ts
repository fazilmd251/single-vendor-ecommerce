import redis from "../../config/redis/redis";
import { RegisterDto } from "../../interfaces/auth/Auth";
import Credentials from "../../models/users/credentials";
import { AuthError, ForbiddenError, ValidationError } from "../../utils/errors/errors";
import { validateRegisterInput } from "../../validator/auth/auth.validator";
import { otpService } from "../otp/otp.service";

class AuthService {
    async registerUser(data: RegisterDto) {
        const { email } = data;
        const mailTemplate = 'user-activation-mail';
        //checking wether valid data in requst body
        validateRegisterInput({ email });

        //checking otp restrictions and tracking requests
        await otpService.checkOtpRestrictions(email);
        await otpService.trackOtpRequests(email);
        await otpService.sendOtp(email, 'Email Verification mail', mailTemplate);
    }

}


export const authService = new AuthService();