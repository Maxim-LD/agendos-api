# OpenAPI Testing Guide

Quick reference guide for testing your Agendos Backend API using the OpenAPI/Swagger UI documentation.

## Quick Start

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open Swagger UI**:
   Navigate to: http://localhost:5000/docs

3. **Start testing** - Choose from the endpoints below

## Complete Testing Workflow

### Phase 1: Authentication

#### 1.1 Sign Up a New User

**Endpoint**: `POST /auth/signup`

**Test Data**:
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "TestPassword123!",
  "confirm_password": "TestPassword123!"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "User signed up successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullname": "John Doe",
      "email": "john@example.com",
      "is_email_verified": false,
      "maximum_daily_capacity": 100
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Save**: Copy the `accessToken` - you'll need it for protected endpoints

**Note**: The refresh token is automatically stored in an HttpOnly cookie

#### 1.2 Verify Email (Optional)

**Endpoint**: `GET /auth/verify-email`

**Parameters**:
- `token` (query): Email verification token sent to the user's email

This simulates clicking the email verification link.

#### 1.3 Login with Existing Credentials

**Endpoint**: `POST /auth/login`

**Test Data**:
```json
{
  "email": "john@example.com",
  "password": "TestPassword123!"
}
```

**Expected Response** (200 OK):
- Provides new access token
- Refresh token stored in cookies

### Phase 2: User Onboarding

#### 2.1 Complete User Profile

**Endpoint**: `PATCH /user/onboarding`

**Authorization**: 
1. Click the **Authorize** (🔒) button at top-right
2. Paste your access token: `Bearer eyJhbGciOiJIUzI1NiIs...`
3. Click **Authorize**

**Test Data**:
```json
{
  "username": "johndoe",
  "status": "Active",
  "occupation": "Software Engineer",
  "phone": "+1234567890",
  "maximum_daily_capacity": 120,
  "date_of_birth": "1990-01-01"
}
```

**Expected Response** (200 OK):
- Returns updated user object with all profile information

### Phase 3: Task Management

#### 3.1 Create a Task

**Endpoint**: `POST /tasks`

**Authorization**: Use the same token from Phase 1

**Test Data**:
```json
{
  "title": "Complete API Documentation",
  "description": "Write comprehensive documentation for all endpoints",
  "effort_estimate_minutes": 180,
  "energy_required": "moderate",
  "progress_interval": "once",
  "urgency": "high",
  "reminders": true,
  "due_date": "2026-04-01T17:00:00Z"
}
```

**Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete API Documentation",
    "description": "Write comprehensive documentation for all endpoints",
    "status": "not_started",
    "effort_estimate_minutes": 180,
    "progress_percentage": 0,
    "progress_interval": "once",
    "urgency": "high",
    "reminders": true,
    "is_active": true,
    "created_at": "2026-03-24T10:30:00Z",
    "updated_at": "2026-03-24T10:30:00Z"
  }
}
```

**Save**: Copy the task `id` for the next tests

#### 3.2 Get All User Tasks

**Endpoint**: `GET /tasks`

**Authorization**: Same token as before

**Query Parameters** (Optional):
- `status`: Filter by status (`not_started`, `ongoing`, `completed`)
- `urgency`: Filter by urgency (`low`, `medium`, `high`)
- `page`: Pagination page (default: 1)
- `limit`: Items per page (default: 10)

**Test Examples**:
- Get all tasks: No parameters
- Get high urgency tasks: `urgency=high`
- Get ongoing tasks: `status=ongoing`
- Get paginated results: `page=1&limit=5`

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Complete API Documentation",
      ...
    }
  ]
}
```

#### 3.3 Get Single Task by ID

**Endpoint**: `GET /tasks/{id}`

**Authorization**: Same token

**Path Parameters**:
- `id`: Task ID (from previous response)

**Expected Response** (200 OK):
- Returns the full task object

### Phase 4: Password Management

#### 4.1 Request Password Reset

**Endpoint**: `POST /auth/forgot-password`

**Test Data**:
```json
{
  "email": "john@example.com"
}
```

**Expected Response** (200 OK):
- Password reset email sent
- In development, check your email or logs for reset link

#### 4.2 Reset Password

**Endpoint**: `POST /auth/reset-password`

**Test Data**:
```json
{
  "token": "reset_token_from_email",
  "password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Expected Response** (200 OK):
- Password successfully changed

#### 4.3 Refresh Access Token

**Endpoint**: `POST /auth/refresh-token`

**Explanation**: Get a new access token without logging in again
- Uses the refresh token stored in cookies automatically
- Useful when access token expires

**Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_token_string"
  }
}
```

## Common Test Scenarios

### Scenario 1: New User Journey

1. Sign up → Get access token
2. Verify email (if needed)
3. Complete onboarding profile
4. Create first task
5. View all tasks

### Scenario 2: Task Management Workflow

1. Create task with high urgency
2. Get all high urgency tasks
3. Get specific task details
4. (Future) Update task status
5. (Future) Mark as completed

### Scenario 3: Account Security

1. Sign up with password
2. Request password reset
3. Reset with new password
4. Login with new password
5. Refresh token to verify it works

## Error Testing

Test error handling by trying these scenarios:

### 401 Unauthorized Errors
- Call protected endpoint without token
- Use expired/invalid token
- Test with malformed Bearer token

### 400 Bad Request Errors
- Sign up with mismatched passwords
- Create task with missing required fields
- Login with non-existent email
- Use invalid email format

### 429 Rate Limit Errors
- Make multiple requests in quick succession (>100 in 15 min)
- Test auth endpoints with high frequency

### 404 Not Found Errors
- Get task with non-existent ID
- Try to access user that doesn't exist

## Response Headers to Check

When testing, examine the response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1711270800

Set-Cookie: refresh-token=jwt_token; Path=/; HttpOnly
Content-Type: application/json; charset=utf-8
```

## Exporting API Tests

You can export tests from Swagger UI for use in Postman:

1. In Swagger UI, click the three dots menu icon
2. Select "Download as JSON"
3. Import into Postman:
   - Open Postman
   - Click Import
   - Select the downloaded JSON file

## Browser Console Tips

Check the Network tab in browser DevTools:

1. Open DevTools (F12)
2. Go to Network tab
3. Perform API calls through Swagger UI
4. Click on requests to see:
   - Request headers and body
   - Response headers and body
   - Timing information
   - Status codes

## Useful cURL Commands

Test endpoints from command line:

### Sign Up
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "confirm_password": "Password123!"
  }'
```

### Get Tasks (with Bearer Token)
```bash
curl -X GET http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer your_access_token_here"
```

### Create Task (with Bearer Token)
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer your_access_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "energy_required": "moderate",
    "urgency": "high"
  }'
```

## Debugging Tips

1. **Check Authentication**: Ensure token is copied correctly without extra spaces
2. **Monitor Logs**: Watch server console for detailed error messages
3. **Test in Isolation**: Test one endpoint at a time before combining
4. **Verify Data**: After creating task, fetch it to confirm storage
5. **Check Timestamps**: Ensure date formats are ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)

## Next Steps

After testing the basic workflow:

- [ ] Test error scenarios
- [ ] Verify rate limiting works
- [ ] Check CORS headers in browser
- [ ] Test on production server
- [ ] Create Postman collection for CI/CD
- [ ] Document any API changes
- [ ] Update OpenAPI spec as needed

