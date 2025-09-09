import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { APPROVED_EMAILS } from "@/lib/constants"

const handler = toNextJsHandler(auth)

// Helper function to add CORS headers
function addCorsHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', 'https://stepbox.app.creativecontext.studio');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
  return newResponse;
}

export const GET = async (request: Request) => {
  console.log("Auth GET request:", request.url);
  const response = await handler.GET(request);
  return addCorsHeaders(response);
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
  
  const response = await handler.POST(request);
  return addCorsHeaders(response);
}

export const OPTIONS = async (request: Request) => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://stepbox.app.creativecontext.studio',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}