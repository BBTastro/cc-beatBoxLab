import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, userSessions, userActivity } from "@/lib/schema";
import { isAdmin } from "@/lib/admin";
import { eq, desc, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Get user email from headers (set by auth middleware)
    const userEmail = request.headers.get("x-user-email");
    
    // Check if user is admin
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all users with their session and activity stats
    const usersWithStats = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        totalSessions: count(userSessions.id),
        lastSignIn: sql<Date>`MAX(${userSessions.signInAt})`,
        totalActivity: count(userActivity.id),
        lastActivity: sql<Date>`MAX(${userActivity.timestamp})`,
      })
      .from(user)
      .leftJoin(userSessions, eq(user.id, userSessions.userId))
      .leftJoin(userActivity, eq(user.id, userActivity.userId))
      .groupBy(user.id, user.name, user.email, user.image, user.createdAt, user.updatedAt)
      .orderBy(desc(user.createdAt));

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
