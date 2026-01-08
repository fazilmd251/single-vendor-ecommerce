import redis from "../../config/redis/redis";
import crypto from 'crypto';
import { ForbiddenError } from "../../utils/errors/errors";
import { generateOtp } from "../../utils/otp";
import { emailService } from "../email/email.service";

class OtpService {

    async checkOtpRestrictions(email: string) {

        if (await redis.get(`otp_lock:${email}`)) {
            throw new ForbiddenError("Account locked due to multiple attempt ,try again after 30 mins");
        }

        if (await redis.get(`otp_spam_lock:${email}`)) {
            throw new ForbiddenError("Too many OTP requests, wait one hour before making making new");
        }

        if (await redis.get(`otp_cooldown:${email}`)) {
            throw new ForbiddenError("Wait one min before requeting a new OTP.");
        }

    }

    async trackOtpRequests(email: string) {
        const otpRequestKey = `otp_request_count:${email}`;
        const count = parseInt(await redis.get(otpRequestKey) || "0");
        if (count > 3) {
            await redis.set(`otp_spam_lock:${email}`, "locked", { ex: 3600 });
            throw new ForbiddenError("too many OTP requests, wait one hour before making new");
        }
        await redis.set(otpRequestKey, count + 1, { ex: 3600 });
        await redis.set(`otp_cooldown:${email}`, "1", { ex: 60 })
    }

    async sendOtp(email: string, subject: string, template: string) {
        const otp = generateOtp();
        const hashedOtp = crypto.createHash("sha256").update(otp).digest('hex');
        await redis.set(`otp:${email}`, hashedOtp, { ex: 300 })
        await emailService.sendEmail(email, subject, template, { email, otp })
    }



}

export const otpService = new OtpService();