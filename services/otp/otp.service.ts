import redis from "../../config/redis/redis";
import crypto from "crypto";
import { AuthError, ForbiddenError, ValidationError } from "../../utils/errors/errors";
import { generateOtp } from "../../utils/otp";
import { emailService } from "../email/email.service";

export const OTP_CONFIG = {
  COOLDOWN_SEC: 60,
  MAX_REQUESTS_PER_HOUR: 3,
  SPAM_LOCK_SEC: 3600,
  ACCOUNT_LOCK_SEC: 1800,
  OTP_TTL_SEC: 300, // 5 minutes
};


export const otpKeys = (email: string) => ({
  otpLock: `otp_lock:${email}`,
  otpSpamLock: `otp_spam_lock:${email}`,
  otpCooldown: `otp_cooldown:${email}`,
  otpRequestCount: `otp_request_count:${email}`,
  otp: `otp:${email}`,
});

class OtpService {

  async checkOtpRestrictions(email: string) {
    const keys = otpKeys(email);

    if (await redis.get(keys.otpLock)) {
      throw new ForbiddenError(
        "Account locked due to multiple attempts, try again after 30 mins"
      );
    }

    if (await redis.get(keys.otpSpamLock)) {
      throw new ForbiddenError(
        "Too many OTP requests, wait one hour before making new"
      );
    }

    if (await redis.get(keys.otpCooldown)) {
      throw new ForbiddenError("Wait one minute before requesting a new OTP.");
    }
  }

  async trackOtpRequests(email: string) {
    const keys = otpKeys(email);

    const count = parseInt((await redis.get(keys.otpRequestCount)) || "0");

    // ✅ Correct condition: lock when count >= max allowed
    if (count >= OTP_CONFIG.MAX_REQUESTS_PER_HOUR) {
      await redis.set(keys.otpSpamLock, "locked", { ex: OTP_CONFIG.SPAM_LOCK_SEC });
      throw new ForbiddenError(
        "Too many OTP requests, wait one hour before making new"
      );
    }

    // Track request count for 1 hour
    await redis.set(keys.otpRequestCount, (count + 1).toString(), {
      ex: OTP_CONFIG.SPAM_LOCK_SEC,
    });

    // Cooldown of 1 minute
    await redis.set(keys.otpCooldown, "1", { ex: OTP_CONFIG.COOLDOWN_SEC });
  }

  async sendOtp(email: string, subject: string, template: string) {
    const keys = otpKeys(email);

    // Generate OTP
    const otp = generateOtp();

    // Hash OTP (never store plain)
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Store hashed otp in redis for 5 minutes
    await redis.set(keys.otp, hashedOtp, { ex: OTP_CONFIG.OTP_TTL_SEC });

    // Send mail
    await emailService.sendEmail(email, subject, template, { email, otp });

    // Optional: return for dev/debug only (don't use in prod)
    if (process.env.NODE_ENV === "development") {
      return otp;
    }
  }

async verifyOtp(email: string, otp: string) {
  const keys = otpKeys(email);

  const storedHash = await redis.get(keys.otp);
  if (!storedHash) throw new AuthError("Invalid or expired OTP");

  const hashedOtp = this.hashOtp(otp);
  const otpAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(otpAttemptsKey)) || "0");

  if (hashedOtp !== storedHash) {
    const newAttempts = failedAttempts + 1;

    if (newAttempts >= 3) {
      await redis.set(keys.otpLock, "locked", { ex: OTP_CONFIG.ACCOUNT_LOCK_SEC });
      await redis.del(keys.otp, otpAttemptsKey);
      throw new ForbiddenError("Too many failed attempts. Try again later.");
    }

    await redis.set(otpAttemptsKey, newAttempts.toString(), { ex: OTP_CONFIG.OTP_TTL_SEC });
    throw new AuthError("Invalid or expired OTP");
  }

  await redis.del(keys.otp, otpAttemptsKey);
  return true;
}


  // helper for hashing OTP during verification
  hashOtp(otp: string) {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  async getStoredotp(email: string) {
    return await redis.get(otpKeys(email).otp)
  }


  async deleteOtp(email: string) {
    await redis.del(otpKeys(email).otp);
  }

}

export const otpService = new OtpService();
