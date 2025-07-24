import { createClient } from "redis";

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || process.env.KV_URL,
});

// Connect to Redis
redis.on("error", (err) => console.log("Redis Client Error", err));

async function getRedisClient() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function GET() {
  try {
    const client = await getRedisClient();
    const customTime = await client.get("customTime");

    return Response.json({
      customTime: customTime,
      hasCustomTime: customTime !== null,
    });
  } catch (error) {
    console.error("Error fetching custom time from Redis:", error);
    return Response.json({
      customTime: null,
      hasCustomTime: false,
    });
  }
}

export async function POST(request) {
  try {
    const { time } = await request.json();

    if (!time) {
      return Response.json({ error: "Time is required" }, { status: 400 });
    }

    // Parse time (HH:MM format) and apply to today's date
    const [hours, minutes] = time.split(":").map(Number);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return Response.json(
        { error: "Invalid time format. Use HH:MM" },
        { status: 400 },
      );
    }

    const today = new Date();
    today.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds=0, milliseconds=0

    const customTimeString = today.toISOString();

    // Store in Redis
    const client = await getRedisClient();
    await client.set("customTime", customTimeString);

    return Response.json({
      success: true,
      customTime: customTimeString,
    });
  } catch (error) {
    console.error("Error setting custom time in Redis:", error);
    return Response.json(
      { error: "Failed to set custom time" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const client = await getRedisClient();
    await client.del("customTime");
    return Response.json({ success: true, message: "Custom time cleared" });
  } catch (error) {
    console.error("Error deleting custom time from Redis:", error);
    return Response.json(
      { error: "Failed to clear custom time" },
      { status: 500 },
    );
  }
}
