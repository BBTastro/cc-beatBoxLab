import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userActivity } from "@/lib/schema";
import { isAdmin } from "@/lib/admin";
import { desc, eq, and, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get user email from headers (set by auth middleware)
    const userEmail = request.headers.get("x-user-email");
    
    // Check if user is admin
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const activityType = searchParams.get("activityType");
    const days = parseInt(searchParams.get("days") || "30");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Calculate date filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query with conditions
    const conditions = [gte(userActivity.timestamp, startDate)];
    
    if (userId) {
      conditions.push(eq(userActivity.userId, userId));
    }
    
    if (activityType) {
      conditions.push(eq(userActivity.activityType, activityType));
    }

    const activities = await db
      .select()
      .from(userActivity)
      .where(and(...conditions))
      .orderBy(desc(userActivity.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Admin activity API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
