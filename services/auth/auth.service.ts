import redis from "../../config/redis/redis";
import { RegisterDto, VerifyUser } from "../../interfaces/auth/Auth";
import { AuthError, ValidationError } from "../../utils/errors/errors";
import { validateRegisterInput, validateVerifyUser } from "../../validator/auth/auth.validator";
import { OTP_CONFIG, otpService } from "../otp/otp.service";
import User from '../../models/users/user'


class AuthService {
    async registerUser(data: RegisterDto) {
        const mailTemplate = 'user-activation-mail';
        //checking wether valid data in requst body
        validateRegisterInput(data);
        const email = data.email;
        //checking otp restrictions and tracking requests
        await otpService.checkOtpRestrictions(email);
        await otpService.trackOtpRequests(email);
        await otpService.sendOtp(email, 'Email Verification mail', mailTemplate);
    }

    async verifyUser(data: VerifyUser) {
        //validating input
        validateVerifyUser(data);
        const { email, otp, name, password } = data;
        const existingUser = await User.findOne({ email })
        if (existingUser) throw new AuthError("User already exists with this email");

        //verifying otp
        await otpService.verifyOtp(email, otp);
        const user = await User.create({ email, name, password })
        if (!user) throw new ValidationError("user creation failed");
        return user;
    }

}


export const authService = new AuthService();