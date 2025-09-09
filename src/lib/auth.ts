import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import { APPROVED_EMAILS } from "./constants"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  callbacks: {
    async signIn({ user }: { user: any }) {
      console.log("SignIn callback triggered with user:", user);
      
      // Check if the user's email is in the approved list
      const userEmail = user.email
      
      if (!userEmail) {
        console.log("No email found in user data");
        throw new Error("No email found in user data")
      }
      
      console.log("Checking email:", userEmail, "against approved list:", APPROVED_EMAILS);
      
      if (!APPROVED_EMAILS.includes(userEmail.toLowerCase())) {
        console.log("Access denied for email:", userEmail);
        throw new Error(`Access denied. Email ${userEmail} is not authorized to access this application.`)
      }
      
      console.log("Access granted for email:", userEmail);
      return true
    }
  }
})

// Re-export the approved emails for use in other parts of the app
export { APPROVED_EMAILS }