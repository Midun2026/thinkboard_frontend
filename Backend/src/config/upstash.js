import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

let ratelimit;

if (process.env.NODE_ENV === "production") {
  // ✅ Real limits in prod
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  });
} else {
  // ✅ No real limits in dev
  ratelimit = {
    limit: async () => ({ success: true, limit: 9999, remaining: 9999, reset: Date.now() + 1000 }),
  };
}

export default ratelimit;
