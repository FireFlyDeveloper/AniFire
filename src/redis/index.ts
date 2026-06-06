import Redis from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error("Redis connection failed after 3 retries");
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  // Connection pooling configuration
  family: 4, // IPv4
  keepAlive: 30000, // Keep connections alive
  enableReadyCheck: true, // Check if Redis is ready
  enableOfflineQueue: true, // Enable offline queue for better reliability
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

export default redis;
