# Steps to User List Implementation

## Overview
Create an admin-only user management panel that tracks user sign-ins, emails, and return visits for the admin user (creativecontextstudio00@gmail.com).

## Implementation Steps

### Step 1: Database Schema Updates
- [ ] Add new table `user_sessions` to track user sign-ins
- [ ] Add new table `user_activity` to track user returns and activity
- [ ] Update existing schema to include user tracking fields

### Step 2: Authentication & Authorization
- [ ] Verify admin user detection (creativecontextstudio00@gmail.com)
- [ ] Add admin-only route protection
- [ ] Create admin context/hook for checking admin status

### Step 3: User Tracking System
- [ ] Implement sign-in tracking in auth flow
- [ ] Add user activity logging (page visits, returns)
- [ ] Create session management for tracking user sessions

### Step 4: Admin API Endpoints
- [ ] Create `/api/admin/users` endpoint to fetch user list
- [ ] Create `/api/admin/user-sessions` endpoint for session data
- [ ] Create `/api/admin/user-activity` endpoint for activity tracking
- [ ] Add proper admin authorization checks

### Step 5: Admin UI Components
- [ ] Create `AdminUserList` component
- [ ] Create `UserSessionTable` component
- [ ] Create `UserActivityChart` component
- [ ] Add admin panel to settings page

### Step 6: Data Display Features
- [ ] User list with email, sign-in date, last seen
- [ ] Session history per user
- [ ] Return visit tracking
- [ ] Activity timeline
- [ ] Export functionality for admin data

### Step 7: Integration & Testing
- [ ] Test admin panel access
- [ ] Verify user tracking works
- [ ] Test data export functionality
- [ ] Ensure proper error handling

## Technical Requirements

### Database Tables
```sql
-- User sessions tracking
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  sign_in_at TIMESTAMP DEFAULT NOW(),
  sign_out_at TIMESTAMP,
  session_duration INTEGER, -- in minutes
  ip_address TEXT,
  user_agent TEXT
);

-- User activity tracking
CREATE TABLE user_activity (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'sign_in', 'page_visit', 'return_visit'
  page_url TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id INTEGER REFERENCES user_sessions(id)
);
```

### API Endpoints
- `GET /api/admin/users` - List all users with stats
- `GET /api/admin/user-sessions` - Get session data
- `GET /api/admin/user-activity` - Get activity data
- `POST /api/admin/track-activity` - Track user activity

### Admin UI Features
- User list with email, sign-in count, last seen
- Session history table
- Activity timeline
- Export to CSV/JSON
- Real-time updates

## Security Considerations
- Admin-only access verification
- Rate limiting on admin endpoints
- Secure data handling
- Privacy compliance for user data

## Success Criteria
- [ ] Admin can view all user sign-ins
- [ ] Admin can see user return patterns
- [ ] Data is properly tracked and stored
- [ ] UI is intuitive and functional
- [ ] Export functionality works
- [ ] Proper error handling and loading states
