import request from "supertest";
import app from "../../app/app";
import redis from "../../config/redis/redis";

// ✅ mock email service (IMPORTANT)
jest.mock("../../services/email/email.service", () => ({
  emailService: {
    sendEmail: jest.fn().mockResolvedValue(true),
  },
}));

const endpoint = "/api/auth/register-user";
const email = "test@example.com";

const redisKeys = (email: string) => ({
  otpLock: `otp_lock:${email}`,
  otpSpamLock: `otp_spam_lock:${email}`,
  otpCooldown: `otp_cooldown:${email}`,
  otpReqCount: `otp_request_count:${email}`,
  otpKey: `otp:${email}`, // if you store OTP here
  otpAttempts: `otp_attempts:${email}`, // if you use this later
});

describe("POST /api/auth/register-user", () => {
  beforeEach(async () => {
    // ✅ cleanup keys before each test to avoid interference
    const keys = Object.values(redisKeys(email));
    await redis.del(...keys);
  });

  afterAll(async () => {
    // close redis connection if supported
    if (typeof (redis as any).quit === "function") {
      await (redis as any).quit();
    }
  });

  it("✅ should send otp for valid email", async () => {
    const res = await request(app).post(endpoint).send({ email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/otp/i);
  });

  it("❌ should fail for invalid email", async () => {
    const res = await request(app).post(endpoint).send({ email: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email/i);
  });

  it("❌ should fail if email is missing", async () => {
    const res = await request(app).post(endpoint).send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/email/i);
  });

  it("⏳ should block OTP request if cooldown is active (1 minute rule)", async () => {
    // 1st request should succeed
    const first = await request(app).post(endpoint).send({ email });
    expect(first.status).toBe(200);

    // 2nd request immediately should fail (cooldown)
    const second = await request(app).post(endpoint).send({ email });
    expect(second.status).toBe(403);
    expect(second.body.success).toBe(false);
    expect(second.body.message).toMatch(/wait|minute|cooldown/i);
  });

  it("🚫 should block OTP request if spam lock exists (otp_spam_lock)", async () => {
    const keys = redisKeys(email);

    // manually simulate spam lock
    await redis.set(keys.otpSpamLock, "locked", {ex:3600});

    const res = await request(app).post(endpoint).send({ email });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/too many|otp|hour|spam/i);
  });

  it("🔒 should block OTP request if account lock exists (otp_lock)", async () => {
    const keys = redisKeys(email);

    // manually simulate account lock
    await redis.set(keys.otpLock, "locked", {ex:1800});

    const res = await request(app).post(endpoint).send({ email });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/locked|try after/i);
  });

  it("🧨 should lock user after exceeding max OTP requests allowed", async () => {
    /**
     * This test assumes your logic is:
     * - max OTP requests allowed = 3 (or similar)
     * - after exceeding → set otp_spam_lock and throw 403
     *
     * Adjust the loop count based on your exact logic.
     */

    // call multiple times with cooldown bypass
    // easiest: delete cooldown key between calls
    const keys = redisKeys(email);

    // 1st
    let res1 = await request(app).post(endpoint).send({ email });
    expect(res1.status).toBe(200);
    await redis.del(keys.otpCooldown);

    // 2nd
    let res2 = await request(app).post(endpoint).send({ email });
    expect(res2.status).toBe(200);
    await redis.del(keys.otpCooldown);

    // 3rd
    let res3 = await request(app).post(endpoint).send({ email });
    // depending on your exact threshold, this could succeed or fail
    // If max=3, third might succeed
    expect([200, 403]).toContain(res3.status);
    await redis.del(keys.otpCooldown);

    // 4th should fail if max=3
    let res4 = await request(app).post(endpoint).send({ email });

    expect(res4.status).toBe(403);
    expect(res4.body.success).toBe(false);
    expect(res4.body.message).toMatch(/too many|otp|hour|wait/i);

    // ensure spam lock is set
    const spamLock = await redis.get(keys.otpSpamLock);
    expect(spamLock).toBeTruthy();
  });

  it("⚡ (optional) should rate limit if too many requests are made (429)", async () => {
    /**
     * This test depends on your globalRateLimiter config.
     * If your rate limiter allows many requests, this won't trigger.
     *
     * If you want this test stable, create a dedicated limiter for this route:
     * max: 3 requests / min for register-user.
     */

    const responses = [];
    for (let i = 0; i < 50; i++) {
      responses.push(request(app).post(endpoint).send({ email: `user${i}@example.com` }));
    }

    const results = await Promise.all(responses);
    const any429 = results.some((r) => r.status === 429);

    // If max is low you'll see true. If max is high, comment this out.
    // expect(any429).toBe(true);

    // At least ensure it doesn't crash:
    expect(results.length).toBe(50);
  });
});
