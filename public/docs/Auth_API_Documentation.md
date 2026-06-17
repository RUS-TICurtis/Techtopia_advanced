# TECHTOPIA CRM — AUTHENTICATION API DOCUMENTATION

## SECTION 1 — MODULE OVERVIEW

**Business Purpose:**
The Authentication module handles identity verification and access management for the Techtopia CRM platform. It provides token-based security using JWT (JSON Web Tokens) for stateless authentication and opaque refresh tokens for session prolongation. It also exposes standard flows for forgotten passwords, email verification, and secure logout.

**Architecture & Flow:**
- Authentication: JWT Bearer tokens with Short TTL (e.g., 15-60 mins).
- Session Management: Long-lived refresh tokens stored in PostgreSQL (`RefreshTokens` table).
- Multi-Tenancy: The `TenantId` is embedded directly into the JWT payload as a claim.
- Authorization: Roles and granular ABAC/RBAC Permissions are embedded into the JWT or checked at the middleware level.

---

## SECTION 2 — APPLICATION FLOW

### User Journey: Standard Login & Refresh

**Step 1:**
Frontend presents the login screen.

**Step 2:**
User enters email and password, frontend calls:
`POST /api/v1/auth/login`

**Step 3:**
Backend (`AuthService.cs`) validates the user:
- Checks if user exists via `AppDbContext.Users`
- Verifies password hash using `BCrypt.Net`
- Checks `IsActive` flag.

**Step 4:**
Backend generates a short-lived Access Token (JWT) and a long-lived Refresh Token.

**Step 5:**
Backend stores the Refresh Token in the database and returns both tokens + User context to the frontend.

**Step 6:**
Frontend stores the tokens (e.g., HttpOnly cookie or secure storage) and attaches the Access Token to the `Authorization: Bearer <token>` header for subsequent requests.

**Step 7:**
When the Access Token expires, frontend intercepts the 401 response and calls:
`POST /api/v1/auth/refresh`

**Step 8:**
Backend validates the Refresh Token. If valid and not revoked/expired, it returns a new Access Token and Refresh Token pair.

---

## SECTION 3 — DOMAIN MODEL & DATABASE MAPPING

### Entities
- **User:** Represents the identity of the person logging in.
- **RefreshToken:** Represents a valid session token issued to a user.

### Table: `users`
- `Id` (UUID, PK)
- `TenantId` (UUID, FK to `tenants`)
- `Email` (VARCHAR, Unique)
- `PasswordHash` (VARCHAR)
- `IsActive` (BOOLEAN)

### Table: `refresh_tokens`
- `Id` (UUID, PK)
- `UserId` (UUID, FK to `users` -> Cascade Delete)
- `Token` (VARCHAR)
- `ExpiresAt` (TIMESTAMP)
- `Revoked` (BOOLEAN)

---

## SECTION 4 — ENDPOINT INVENTORY

### 1. Login

**Method:** `POST`
**Route:** `/api/v1/auth/login`
**Authentication:** Not Required
**Permission:** None

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "email": "admin@techtopia.com",
  "password": "Password123!"
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "6f2a89b...",
  "user": {
    "id": "uuid",
    "tenantId": "uuid",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@techtopia.com",
    "username": "admin",
    "phoneNumber": "123456789",
    "profileImageUrl": null,
    "roles": ["Administrator"],
    "permissions": ["lead.view", "lead.create", "finance.view"]
  }
}
```

**Error Responses:**
- `400 Bad Request` (Validation Error)
- `401 Unauthorized` ("Invalid email or password." or "User is inactive.")

---

### 2. Refresh Token

**Method:** `POST`
**Route:** `/api/v1/auth/refresh`
**Authentication:** Not Required
**Permission:** None

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "refreshToken": "6f2a89b..."
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "new_eyJhbGciOiJIUzI1...",
  "refreshToken": "new_6f2a89b...",
  "user": { ... }
}
```

**Error Responses:**
- `401 Unauthorized` ("Invalid refresh token.")

---

### 3. Logout

**Method:** `POST`
**Route:** `/api/v1/auth/logout`
**Authentication:** Required (`Authorization: Bearer {token}`)
**Permission:** None

**Success Response (204 No Content):**
No body returned. All refresh tokens for the given user ID are marked as revoked.

---

### 4. Stubbed Endpoints (Not Fully Implemented)
*These endpoints exist on the routing table but return `200 OK` with no body/logic.*

- `POST /api/v1/auth/forgot-password` (Body: `ForgotPasswordRequest`)
- `POST /api/v1/auth/reset-password` (Body: `ResetPasswordRequest`)
- `POST /api/v1/auth/verify-email` (Body: `VerifyEmailRequest`)
- `POST /api/v1/auth/resend-verification` (Body: `ResendVerificationRequest`)

---

## SECTION 5 — REQUEST/RESPONSE SCHEMAS

### Request DTOs

| DTO | Property | Type | Required | Notes |
|---|---|---|---|---|
| **LoginRequest** | Email | string | Yes | |
| | Password | string | Yes | |
| **RefreshTokenRequest** | Token | string | Yes | The expired JWT |
| | RefreshToken | string | Yes | The opaque refresh token string |
| **ForgotPasswordRequest** | Email | string | Yes | |
| **ResetPasswordRequest** | Email | string | Yes | |
| | Token | string | Yes | Reset token sent via email |
| | NewPassword | string | Yes | |
| **VerifyEmailRequest** | Email | string | Yes | |
| | Token | string | Yes | Verification token sent via email |
| **ResendVerificationRequest**| Email | string | Yes | |

### Response DTOs

| DTO | Property | Type | Description |
|---|---|---|---|
| **LoginResponse** | AccessToken | string | The JWT bearer token |
| | RefreshToken | string | Opaque token for session renewal |
| | User | UserResponse | User context and claims |
| **UserResponse** | Id | Guid | Unique User ID |
| | TenantId | Guid | Associated Tenant ID |
| | FirstName | string | |
| | LastName | string | |
| | Email | string | |
| | Username | string | |
| | PhoneNumber | string | |
| | ProfileImageUrl | string | |
| | Roles | string[] | Array of role names |
| | Permissions | string[] | Array of permission codes |

---

## SECTION 6 — IMPLEMENTATION GAPS

**MISSING IMPLEMENTATION:**
- `forgot-password`, `reset-password`, `verify-email`, and `resend-verification` routes are mapped but entirely stubbed out (no email service integration exists).
- Passkeys, MFA, and SSO (SAML/OIDC) are NOT YET IMPLEMENTED.
- Real-time invalidation of active JWTs upon role/permission changes (since JWTs are stateless, they must expire naturally or be tracked via a blocklist, which does not exist).
