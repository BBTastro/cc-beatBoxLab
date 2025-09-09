# Admin Features Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Database Migration
- [x] Database migration applied (`npx drizzle-kit push`)
- [x] `userSessions` table exists
- [x] `userActivity` table exists
- [x] All foreign key relationships are correct

### 2. Environment Variables
- [ ] `NEXT_PUBLIC_APP_URL` set to correct domain
- [ ] Database connection string is correct
- [ ] Google OAuth credentials are updated for new domain
- [ ] All required environment variables are set

### 3. Admin Configuration
- [x] Admin email (`creativecontextstudio00@gmail.com`) is configured
- [x] Admin access control is working
- [x] Session-based authentication is implemented

## Post-Deployment Testing

### 1. Admin Authentication
- [ ] Admin user can sign in successfully
- [ ] Admin panel appears in settings page
- [ ] Non-admin users cannot see admin panel

### 2. Admin API Endpoints
- [ ] `/api/admin/health` - Health check endpoint
- [ ] `/api/admin/users` - User list endpoint
- [ ] `/api/admin/sessions` - Session data endpoint
- [ ] `/api/admin/activity` - Activity data endpoint

### 3. Admin UI Components
- [ ] Admin panel loads without errors
- [ ] User list displays correctly
- [ ] Session data loads and displays
- [ ] Activity data loads and displays
- [ ] Export functionality works
- [ ] Error handling displays properly

### 4. User Tracking
- [ ] Page visits are tracked correctly
- [ ] User sessions are created
- [ ] Activity data is stored in database
- [ ] No "Internal server error" in console

## Testing URLs

### Admin Health Check
```
GET /api/admin/health
Expected: 200 OK with admin status
```

### Database Test
```
GET /api/test-db
Expected: 200 OK with database status
```

### Admin Panel
```
GET /settings (as admin user)
Expected: Admin panel visible below Account Information
```

## Common Issues & Solutions

### 1. "Failed to fetch users" Error
- **Cause**: Database connection or table missing
- **Solution**: Check database migration and connection

### 2. "Unauthorized" Error
- **Cause**: Session not found or user not admin
- **Solution**: Verify admin email configuration and session

### 3. "Internal server error" in User Tracking
- **Cause**: Database insert failure or missing tables
- **Solution**: Check database connectivity and table structure

### 4. Admin Panel Not Visible
- **Cause**: User not recognized as admin
- **Solution**: Verify email matches admin configuration

## Production URLs

- **Vercel**: https://ccstep-box.vercel.app
- **Custom Domain**: https://stepbox.app.creativecontext.studio
- **Admin Panel**: https://stepbox.app.creativecontext.studio/settings

## Environment Variables to Verify

```bash
NEXT_PUBLIC_APP_URL=https://ccstep-box.vercel.app
DATABASE_URL=<production-database-url>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
```

## Success Criteria

- [ ] Admin user can access admin panel
- [ ] All admin API endpoints return data
- [ ] User tracking works without errors
- [ ] Admin panel displays user data correctly
- [ ] Export functionality works
- [ ] No console errors in production
