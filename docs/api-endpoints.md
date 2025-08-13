# API Endpoints Documentation

## Base URL
- Development: `http://localhost:3001/api/v1`
- Documentation: `http://localhost:3001/api/docs`

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}