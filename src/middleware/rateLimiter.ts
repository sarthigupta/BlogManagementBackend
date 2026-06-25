import { Context } from "hono";
import  redis  from "../common/lib/redis.js"

export function createRateLimiter(
  windowSeconds = 60, // 1 minute
  maxRequests = 10
) {
  return async (c: Context, next: () => Promise<void>) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0] || "unknown";

    const key = `ratelimit:${ip}`;

    // Increase request count
    const count = await redis.incr(key);

    // Set expiry only on first request
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    // Block if limit exceeded
    if (count > maxRequests) {
      return c.json(
        {
          success: false,
          message: "Too many requests. Try again later.",
        },
        429
      );
    }

    await next();
  };
}