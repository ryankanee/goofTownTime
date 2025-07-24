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
    const timeOffsetData = await client.get("timeOffset");

    if (timeOffsetData) {
      const { offsetMs, setAtRealTime } = JSON.parse(timeOffsetData);
      const currentRealTime = Date.now();
      const elapsedSinceSet = currentRealTime - setAtRealTime;
      const currentCustomTime = new Date(offsetMs + currentRealTime);

      return Response.json({
        customTime: currentCustomTime.toISOString(),
        hasCustomTime: true,
        offset: offsetMs,
      });
    }

    return Response.json({
      customTime: null,
      hasCustomTime: false,
      offset: 0,
    });
  } catch (error) {
    console.error("Error fetching custom time from Redis:", error);
    return Response.json({
      customTime: null,
      hasCustomTime: false,
      offset: 0,
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

    const customTimeMs = today.getTime();
    const currentRealTimeMs = Date.now();

    // Calculate the offset between the desired custom time and real time
    const offsetMs = customTimeMs - currentRealTimeMs;

    // Store the offset and when it was set in Redis
    const timeOffsetData = {
      offsetMs,
      setAtRealTime: currentRealTimeMs,
    };

    const client = await getRedisClient();
    await client.set("timeOffset", JSON.stringify(timeOffsetData));

    return Response.json({
      success: true,
      customTime: today.toISOString(),
      offset: offsetMs,
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
    await client.del("timeOffset");
    return Response.json({ success: true, message: "Custom time cleared" });
  } catch (error) {
    console.error("Error deleting custom time from Redis:", error);
    return Response.json(
      { error: "Failed to clear custom time" },
      { status: 500 },
    );
  }
}
