# Vercel Environment Variables Update

## Issue
The app is trying to access the old Vercel URL (`ccbeat-box.vercel.app`) instead of the new one (`ccstep-box.vercel.app`).

## Environment Variables to Update in Vercel Dashboard

### Required Updates:
1. **NEXT_PUBLIC_APP_URL**
   - Current (incorrect): `https://ccbeat-box.vercel.app`
   - Should be: `https://ccstep-box.vercel.app`

2. **GOOGLE_CLIENT_ID** (if using Google OAuth)
   - Update the authorized redirect URIs in Google Console to include:
     - `https://ccstep-box.vercel.app/api/auth/callback/google`
     - `https://stepbox.app.creativecontext.studio/api/auth/callback/google`

3. **Database Connection** (if using external database)
   - Ensure any database connection strings point to the correct domain

## Steps to Fix:

1. **Go to Vercel Dashboard**
   - Navigate to your project settings
   - Go to Environment Variables section

2. **Update NEXT_PUBLIC_APP_URL**
   - Change from: `https://ccbeat-box.vercel.app`
   - Change to: `https://ccstep-box.vercel.app`

3. **Update Google OAuth Settings** (if applicable)
   - Go to Google Cloud Console
   - Update OAuth 2.0 Client IDs
   - Add new authorized redirect URIs:
     - `https://ccstep-box.vercel.app/api/auth/callback/google`
     - `https://stepbox.app.creativecontext.studio/api/auth/callback/google`

4. **Redeploy**
   - After updating environment variables, redeploy the application
   - Or trigger a new deployment to pick up the changes

## Verification:
After updating, the app should:
- Load correctly at `https://ccstep-box.vercel.app`
- Load correctly at `https://stepbox.app.creativecontext.studio`
- No longer show 404 errors for `/beats` or `/favicon.ico`
- OAuth sign-in should work properly

## Note:
The code itself doesn't contain hardcoded references to the old domain. The issue is purely in the Vercel environment configuration.
