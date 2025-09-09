import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userActivity } from "@/lib/schema";

export async function GET(request: NextRequest) {
  try {
    // Test database connection by trying to query the userActivity table
    const result = await db.select().from(userActivity).limit(1);
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful",
      tableExists: true,
      recordCount: result.length
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        tableExists: false
      },
      { status: 500 }
    );
  }
}
