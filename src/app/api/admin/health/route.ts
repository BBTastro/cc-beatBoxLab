import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { userSessions, userActivity } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        status: "unauthorized", 
        message: "No user session found" 
      }, { status: 401 });
    }
    
    // Check if user is admin
    const isAdminUser = isAdmin(session.user.email);
    if (!isAdminUser) {
      return NextResponse.json({ 
        status: "forbidden", 
        message: "User is not an admin",
        userEmail: session.user.email
      }, { status: 403 });
    }

    // Test database connectivity for admin tables
    let dbStatus = "unknown";
    let tableCounts = {};
    
    try {
      const sessionCount = await db.select().from(userSessions).limit(1);
      const activityCount = await db.select().from(userActivity).limit(1);
      
      dbStatus = "connected";
      tableCounts = {
        userSessions: sessionCount.length,
        userActivity: activityCount.length
      };
    } catch (dbError) {
      dbStatus = "error";
      console.error("Database health check error:", dbError);
    }

    return NextResponse.json({
      status: "healthy",
      message: "Admin API is working correctly",
      userEmail: session.user.email,
      isAdmin: true,
      database: {
        status: dbStatus,
        tableCounts
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Admin health check error:", error);
    return NextResponse.json(
      { 
        status: "error", 
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
