# OpenAPI Documentation Setup

This project includes comprehensive OpenAPI documentation for testing and development purposes.

## Overview

The API documentation is provided in **OpenAPI 3.0** format and is served through **Swagger UI**, an interactive interface for exploring and testing the APIs.

## Accessing the Documentation

After starting the server, you can access the documentation at:

- **Swagger UI (Interactive)**: http://localhost:5000/docs
- **OpenAPI JSON**: http://localhost:5000/docs.json
- **OpenAPI YAML**: http://localhost:5000/docs.yaml

## Features

- **Interactive API Testing**: Test all endpoints directly from the browser
- **Authentication Support**: JWT Bearer token authentication is built-in
- **Request/Response Examples**: Each endpoint includes clear request and response schemas
- **Rate Limiting Information**: Documentation shows rate limit information
- **Error Responses**: Common error responses are documented

## Installation

The required dependencies have been added to `package.json`:

```bash
npm install
# or
pnpm install
```

This installs:
- `swagger-ui-express` - Provides the interactive UI
- `yaml` - Parses the OpenAPI YAML specification

## OpenAPI Specification

The OpenAPI specification is defined in [openapi.yaml](../openapi.yaml) at the root of the project.

### Structure

```yaml
openapi: 3.0.0
info:
  title: Agendos Backend API
  version: 1.0.0
servers:
  - url: http://localhost:5000/api/v1
    description: Development Server
  - url: https://api.agendos.com/api/v1
    description: Production Server
```

### Components

The specification includes:

#### Security Schemes
- **JWT Bearer Token** (`bearerAuth`): Required for protected endpoints

#### Schemas
- **User**: User account information
- **UserProfile**: User profile data for onboarding
- **Task**: Task with status, urgency, and progress tracking
- **ApiResponse**: Standard API response wrapper
- **Error**: Standard error response format

#### Paths (37 endpoints documented)

##### Authentication (`/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /refresh-token` - Refresh access token
- `POST /send-email-verification` - Request email verification
- `GET /verify-email` - Verify email with token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

##### User (`/user`)
- `PATCH /onboarding` - Complete user onboarding profile

##### Tasks (`/tasks`)
- `POST /` - Create new task
- `GET /` - Get all user tasks with filters
- `GET /{id}` - Get task by ID

## Using Swagger UI

### 1. Test Without Authentication

You can test public endpoints (like signup and login) without any setup.

### 2. Test Protected Endpoints (with JWT)

1. First, **login or signup** to get an access token
2. Click the **Authorize** button (lock icon) at the top of the Swagger UI
3. Enter the token in the format: `Bearer your_access_token_here`
4. Click **Authorize**
5. Now you can test protected endpoints

### 3. Example Workflow for Testing

1. **Sign Up**
   - Navigate to `POST /auth/signup`
   - Enter test credentials
   - Execute and receive `accessToken` and refresh token (in cookies)

2. **Complete Onboarding**
   - Navigate to `PATCH /user/onboarding`
   - Add authorization token (from sign-up response)
   - Enter profile details
   - Execute

3. **Create a Task**
   - Navigate to `POST /tasks`
   - Add authorization token
   - Enter task details
   - Execute

4. **Get User Tasks**
   - Navigate to `GET /tasks`
   - Add authorization token
   - Optionally add filters (status, urgency)
   - Execute

## API Response Format

All API responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data based on endpoint
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "statusCode": 400
}
```

## Rate Limiting

Endpoints are rate-limited to prevent abuse:

- **Global rate limit**: 100 requests per 15 minutes per IP
- **Auth endpoints**: Additional rate limiting (5 requests per 15 minutes)
- **Task endpoints**: Standard rate limiting applies

Rate limit information is included in response headers.

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (Development frontend)
- `https://agendos.vercel.app` (Production frontend)
- `http://agendos.local` (Local testing)

## Testing Tools

### Recommended Tools for API Testing

1. **Swagger UI** (Built-in)
   - Best for interactive testing
   - No additional setup required
   - Access at `/docs`

2. **Postman**
   - Import the OpenAPI spec: `http://localhost:5000/docs.json`
   - Create requests and test scenarios
   - Great for CI/CD integration

3. **cURL**
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "fullname": "John Doe",
       "email": "john@example.com",
       "password": "SecurePassword123!",
       "confirm_password": "SecurePassword123!"
     }'
   ```

4. **Thunder Client** (VS Code Extension)
   - Install "Thunder Client" extension
   - Import OpenAPI spec
   - Test directly in VS Code

## Updating the Documentation

To update the OpenAPI documentation:

1. Edit [openapi.yaml](../openapi.yaml)
2. Follow OpenAPI 3.0 specification standards
3. Restart the server to see changes
4. Refresh http://localhost:5000/docs in browser

### Updating Endpoints

When you add new endpoints:

1. Add the route definition
2. Add the path to `openapi.yaml` under the `paths` section
3. Include request/response schemas
4. Document any authentication requirements
5. Add appropriate tags for organization

### Example Endpoint Addition

```yaml
/learning-paths:
  get:
    tags:
      - Learning
    summary: Get learning paths
    description: Retrieve all learning paths available to the user
    security:
      - bearerAuth: []
    responses:
      '200':
        description: Learning paths retrieved successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/ApiResponse'
                - type: object
                  properties:
                    data:
                      type: array
                      items:
                        $ref: '#/components/schemas/LearningPath'
```

## Environment Variables

No special environment variables are needed for OpenAPI documentation. The documentation is automatically served based on the `openapi.yaml` file in the root directory.

## Troubleshooting

### Swagger UI not loading
- Ensure `swagger-ui-express` and `yaml` are installed: `npm install`
- Check that server is running on the correct port
- Clear browser cache and reload

### Authorization not persisting
- Ensure you're using the correct token format: `Bearer your_token_here`
- Check that the token hasn't expired
- Re-authorize to get a fresh token

### OpenAPI specification errors
- Validate YAML syntax in [openapi.yaml](../openapi.yaml)
- Use an online YAML validator: https://www.yamllint.com/
- Check OpenAPI 3.0 specification: https://spec.openapis.org/oas/v3.0.3

## Development Server

To start the development server with OpenAPI docs:

```bash
npm run dev
```

Then navigate to: http://localhost:5000/docs

## Building for Production

The OpenAPI documentation is included in the production build:

```bash
npm run build
npm run start:prod
```

The documentation will be available at the `/docs` endpoint on your production server.

## Additional Resources

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [Swagger Editor](https://editor.swagger.io/) - Edit and validate OpenAPI specs online
- [API Testing Best Practices](https://swagger.io/blog/api-testing/)

