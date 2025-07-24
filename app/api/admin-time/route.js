import { kv } from "@vercel/kv";

export async function GET() {
  try {
    const customTime = await kv.get("customTime");

    return Response.json({
      customTime: customTime,
      hasCustomTime: customTime !== null,
    });
  } catch (error) {
    console.error("Error fetching custom time from KV:", error);
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

    // Store in Vercel KV
    await kv.set("customTime", customTimeString);

    return Response.json({
      success: true,
      customTime: customTimeString,
    });
  } catch (error) {
    console.error("Error setting custom time in KV:", error);
    return Response.json(
      { error: "Failed to set custom time" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await kv.del("customTime");
    return Response.json({ success: true, message: "Custom time cleared" });
  } catch (error) {
    console.error("Error deleting custom time from KV:", error);
    return Response.json(
      { error: "Failed to clear custom time" },
      { status: 500 },
    );
  }
}
