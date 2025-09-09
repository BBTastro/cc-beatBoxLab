import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSessions, userActivity } from "@/lib/schema";
import { isAdmin } from "@/lib/admin";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      userId, 
      email, 
      activityType, 
      pageUrl, 
      action, 
      sessionId, 
      metadata = {} 
    } = body;

    // Validate required fields
    if (!userId || !email || !activityType) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email, activityType" },
        { status: 400 }
      );
    }

    // Create activity record
    const activityId = nanoid();
    const newActivity = await db.insert(userActivity).values({
      id: activityId,
      userId,
      email,
      activityType,
      pageUrl,
      action,
      sessionId,
      metadata,
      timestamp: new Date(),
    }).returning();

    return NextResponse.json({ 
      success: true, 
      activity: newActivity[0] 
    });
  } catch (error) {
    console.error("Track activity API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { 
      userId, 
      email, 
      sessionId,
      signOutAt = new Date()
    } = body;

    // Validate required fields
    if (!userId || !email || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email, sessionId" },
        { status: 400 }
      );
    }

    // Update session with sign out time
    const updatedSession = await db
      .update(userSessions)
      .set({
        signOutAt,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userSessions.id, sessionId),
          eq(userSessions.userId, userId)
        )
      )
      .returning();

    return NextResponse.json({ 
      success: true, 
      session: updatedSession[0] 
    });
  } catch (error) {
    console.error("Update session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
