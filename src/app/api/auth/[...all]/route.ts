import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { APPROVED_EMAILS } from "@/lib/constants"

const handler = toNextJsHandler(auth)

export const GET = async (request: Request) => {
  console.log("Auth GET request:", request.url);
  return handler.GET(request);
}

export const POST = async (request: Request) => {
  console.log("Auth POST request:", request.url);
  
  // Check if this is a sign-in request
  if (request.url.includes('/sign-in/social')) {
    try {
      const body = await request.clone().json();
      console.log("Sign-in request body:", body);
      
      // If it's a Google sign-in, we'll validate after the auth process
      // The actual validation will happen in the auth callbacks
    } catch (error) {
      console.log("Error parsing request body:", error);
    }
  }
  
  return handler.POST(request);
}