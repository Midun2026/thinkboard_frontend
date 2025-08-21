import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const key = `rate-limit:${req.method}:${req.originalUrl}`;
    const { success, limit, remaining, reset } = await ratelimit.limit(key);

    console.log({ success, limit, remaining, reset });

    if (!success) {
      // Calculate seconds until reset
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      // ✅ Ensure CORS headers so browser accepts response
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

      // ✅ Let frontend know when to retry
      res.setHeader("Retry-After", retryAfter);

      return res.status(429).json({
        message: "Too many requests, please try again later",
        limit,
        remaining,
        reset,
        retryAfter, // for debugging/frontend use
      });
    }

    next();
  } catch (error) {
    console.error("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;
