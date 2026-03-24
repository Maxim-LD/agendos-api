# Agendos API OpenAPI Documentation

Complete OpenAPI documentation has been created for the Agendos Backend API for testing and development purposes.

## 📋 What's New

### Files Created

1. **openapi.yaml** (Root directory)
   - Complete OpenAPI 3.0 specification
   - 37 documented endpoints across 4 main modules
   - Request/response schemas for all operations
   - JWT authentication configuration
   - CORS and rate limiting information

2. **src/swagger.ts**
   - Swagger UI integration middleware
   - Serves interactive documentation at `/docs`
   - Provides JSON/YAML endpoints for spec export

3. **docs/OPENAPI_SETUP.md**
   - Comprehensive setup and configuration guide
   - How to access documentation
   - Feature overview
   - Updating documentation procedures

4. **docs/OPENAPI_TESTING_GUIDE.md**
   - Step-by-step testing workflow
   - Example test data and expected responses
   - Common test scenarios
   - Error testing guidelines
   - cURL command examples

### Dependencies Added

```json
{
  "dependencies": {
    "swagger-ui-express": "^5.0.0",
    "yaml": "^2.3.4"
  },
  "devDependencies": {
    "@types/swagger-ui-express": "^4.1.6"
  }
}
```

### Changes to Existing Files

- **src/app.ts**: Added Swagger setup integration
- **package.json**: Added new dependencies (already installed)

## 🚀 Quick Start

### 1. Start the Server
```bash
npm run dev
```

### 2. Open Swagger UI
Navigate to: **http://localhost:5000/docs**

### 3. Start Testing
- Click on any endpoint
- Click "Try it out"
- Enter test data
- Click "Execute"
- View response

## 📖 Documentation Structure

### OpenAPI Spec (openapi.yaml)

#### Servers
- Development: `http://localhost:5000/api/v1`
- Production: `https://api.agendos.com/api/v1`

#### Security
- JWT Bearer Token authentication
- Rate limiting enabled
- CORS configured

#### Endpoints by Module

**Authentication (7 endpoints)**
- POST /auth/signup - Register new user
- POST /auth/login - User login
- POST /auth/refresh-token - Refresh access token
- POST /auth/send-email-verification - Request email verification
- GET /auth/verify-email - Verify email with token
- POST /auth/forgot-password - Request password reset
- POST /auth/reset-password - Reset password with token

**User (1 endpoint)**
- PATCH /user/onboarding - Complete user profile onboarding

**Tasks (3 endpoints)**
- POST /tasks - Create new task
- GET /tasks - Get all user tasks with filters
- GET /tasks/{id} - Get specific task by ID

**Health (1 endpoint)**
- GET / - Health check

#### Schemas
- `User` - User account object
- `UserProfile` - User profile for onboarding
- `Task` - Task with status, urgency, and progress
- `ApiResponse` - Standard success response wrapper
- `Error` - Standard error response wrapper

## 🧪 Testing Workflow

### Phase 1: Authentication
1. Sign up → receive access token
2. Login → receive new access token
3. Refresh token → extend session

### Phase 2: User Setup
1. Complete onboarding profile
2. Verify email (optional)

### Phase 3: Task Management
1. Create tasks
2. Retrieve all tasks
3. Get specific task details

### Phase 4: Password Management
1. Request password reset
2. Reset password with token

## 🔐 JWT Authentication

### How to Authorize

1. Click the **Authorize** 🔒 button (top-right in Swagger UI)
2. In the popup, paste your JWT token:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Click **Authorize**
4. All future requests will include the token

### Getting an Access Token

**Option 1: Sign Up**
```bash
POST /api/v1/auth/signup
Body: {
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

Response includes: `accessToken` (use this for authorization)

**Option 2: Login**
```bash
POST /api/v1/auth/login
Body: {
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response includes: `accessToken`

## 📊 API Response Format

### Success Response (HTTP 200/201)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Endpoint-specific data
  }
}
```

### Error Response (HTTP 4xx/5xx)
```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "statusCode": 400
}
```

## 🛠️ Accessing the Documentation

| Format | URL | Use Case |
|--------|-----|----------|
| **Swagger UI** | http://localhost:5000/docs | Interactive testing |
| **OpenAPI JSON** | http://localhost:5000/docs.json | Postman import |
| **OpenAPI YAML** | http://localhost:5000/docs.yaml | Editor/IDE tools |

## 📚 Documentation Files

### For Setup
- Read **docs/OPENAPI_SETUP.md** for:
  - Detailed setup instructions
  - Feature overview
  - Integration with tools like Postman
  - Updating documentation procedures
  - Troubleshooting guide

### For Testing
- Read **docs/OPENAPI_TESTING_GUIDE.md** for:
  - Complete testing workflow with examples
  - Test data and expected responses
  - Common test scenarios
  - Error testing guidelines
  - cURL command examples
  - Browser DevTools tips

### For Specification
- Review **openapi.yaml** for:
  - Complete API specification
  - Request/response schemas
  - Authentication requirements
  - Rate limiting details
  - All endpoint descriptions

## 🔄 Updating Documentation

When you add or modify endpoints:

1. Update **openapi.yaml** with the new endpoint
2. Restart the server
3. Refresh http://localhost:5000/docs
4. Changes are immediately visible

Example for a new endpoint:
```yaml
/new-endpoint:
  post:
    tags:
      - Category
    summary: Short description
    description: Longer description
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              field:
                type: string
    responses:
      '200':
        description: Success
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApiResponse'
```

## 🧑‍💻 Integration with Development Tools

### Postman

1. In Swagger UI, get the spec URL: http://localhost:5000/docs.json
2. In Postman:
   - Click Import
   - Paste the URL
   - Collection auto-imported with all endpoints

### VS Code - Thunder Client Extension

1. Install "Thunder Client" extension
2. Create new collection
3. Import from OpenAPI: http://localhost:5000/docs.json
4. Test endpoints directly in VS Code

### IntelliJ / WebStorm

1. Click OpenAPI icon in project
2. Add spec URL: http://localhost:5000/docs.json
3. Get IntelliSense help for API calls

## 📝 Example Tests

### Create User and Task - Complete Flow

```bash
# 1. Sign up
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Jane Smith",
    "email": "jane@example.com",
    "password": "Pass123!",
    "confirm_password": "Pass123!"
  }'

# 2. Save the accessToken from response

# 3. Create a task
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review PR",
    "energy_required": "light",
    "urgency": "high"
  }'

# 4. Get all tasks
curl -X GET http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <accessToken>"
```

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Server starts without errors
- [ ] Navigate to http://localhost:5000/docs
- [ ] Swagger UI loads completely
- [ ] Can sign up through Swagger UI
- [ ] Receive access token in response
- [ ] Can authorize with token
- [ ] Can create task with authorization
- [ ] Can retrieve tasks
- [ ] Error responses display correctly
- [ ] Rate limiting works
- [ ] CORS headers present in requests

## 🚨 Troubleshooting

### Issue: Swagger UI shows "Failed to fetch spec"
- **Solution**: Ensure server is running and openapi.yaml is in root directory

### Issue: "Cannot find module 'swagger-ui-express'"
- **Solution**: Run `npm install` again

### Issue: Authorize button doesn't work
- **Solution**: Copy full token including "Bearer " prefix, or just token (UI adds Bearer)

### Issue: Protected endpoints return 401 Unauthorized
- **Solution**: Make sure token is valid, not expired, and properly formatted

## 📋 Next Steps

1. ✅ Run `npm install` (already done)
2. ✅ Start server with `npm run dev`
3. 📖 Read [OPENAPI_SETUP.md](docs/OPENAPI_SETUP.md)
4. 🧪 Follow [OPENAPI_TESTING_GUIDE.md](docs/OPENAPI_TESTING_GUIDE.md)
5. 🚀 Start testing endpoints!

## 📞 Support

For issues or improvements:

1. Check troubleshooting in OPENAPI_SETUP.md
2. Review server logs for detailed errors
3. Validate OpenAPI spec at https://validator.swagger.io/
4. Check endpoint implementation in controllers

---

**Version**: 1.0.0  
**Last Updated**: March 24, 2026  
**API Base URL**: http://localhost:5000/api/v1  
**Docs URL**: http://localhost:5000/docs

