import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSessions } from "@/lib/schema";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      email, 
      ipAddress, 
      userAgent 
    } = body;

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email" },
        { status: 400 }
      );
    }

    // Create session record
    const sessionId = nanoid();
    const newSession = await db.insert(userSessions).values({
      id: sessionId,
      userId,
      email,
      signInAt: new Date(),
      ipAddress,
      userAgent,
      isActive: true,
    }).returning();

    return NextResponse.json({ 
      success: true, 
      session: newSession[0] 
    });
  } catch (error) {
    console.error("Create session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
