import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSessions } from "@/lib/schema";
import { isAdmin } from "@/lib/admin";
import { desc, eq, and } from "drizzle-orm";

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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query with conditions
    const conditions = [];
    if (userId) {
      conditions.push(eq(userSessions.userId, userId));
    }

    const sessions = await db
      .select()
      .from(userSessions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(userSessions.signInAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Admin sessions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
