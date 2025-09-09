import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSessions, userActivity } from "@/lib/schema";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
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

    console.log("Track activity request:", { userId, email, activityType, pageUrl, action, sessionId });

    // Validate required fields
    if (!userId || !email || !activityType) {
      console.error("Missing required fields:", { userId, email, activityType });
      return NextResponse.json(
        { error: "Missing required fields: userId, email, activityType" },
        { status: 400 }
      );
    }

    // Create activity record
    const activityId = nanoid();
    console.log("Creating activity record with ID:", activityId);
    
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

    console.log("Activity record created successfully:", newActivity[0]);

    return NextResponse.json({ 
      success: true, 
      activity: newActivity[0] 
    });
  } catch (error) {
    console.error("Track activity API error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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
