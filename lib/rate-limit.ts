import { NextRequest } from "next/server";

interface RateLimitConfig {
  interval: number; // in milliseconds
  limit: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (request: NextRequest): { success: boolean; remaining: number } => {
      const ip = request.headers.get("x-forwarded-for") || 
                 request.headers.get("x-real-ip") || 
                 "anonymous";
      
      const now = Date.now();
      const record = rateLimitStore.get(ip);

      if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, {
          count: 1,
          resetTime: now + config.interval,
        });
        return { success: true, remaining: config.limit - 1 };
      }

      if (record.count >= config.limit) {
        return { success: false, remaining: 0 };
      }

      record.count++;
      return { success: true, remaining: config.limit - record.count };
    },
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute
