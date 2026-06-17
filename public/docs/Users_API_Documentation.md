# TECHTOPIA CRM — USERS & ROLES API DOCUMENTATION

## SECTION 1 — MODULE OVERVIEW

**Business Purpose:**
The Users module handles the management of system accounts (Users) and their associated access boundaries (Roles & Permissions). By assigning specific Roles (e.g., Administrator, Sales Manager) to Users, the system controls what modules and data each individual can view or modify.

**Architecture & Flow:**
- Database Mapping: `users`, `roles`, `permissions`, `user_roles`, `role_permissions` tables form the RBAC backbone.
- Authentication Profile: The `/me` endpoints allow users to manage their own minimal profile data without needing admin privileges.

---

## SECTION 2 — APPLICATION FLOW

### User Journey: Provisioning a New Employee

**Step 1:**
System Administrator views existing roles:
`GET /api/v1/roles`

**Step 2:**
Admin creates a new user account and assigns an array of `RoleIds`:
`POST /api/v1/users`

**Step 3:**
Backend (`UserService.cs`) creates the User record with a hashed password, links the assigned Roles, and creates `UserRole` mapping records.

**Step 4:**
The new employee logs in via `/api/v1/auth/login`.

**Step 5:**
The employee can view their own profile information via:
`GET /api/v1/users/me`

---

## SECTION 3 — DOMAIN MODEL & DATABASE MAPPING

### Entities
- **User:** The human operator holding an account.
- **Role:** A named collection of Permissions.
- **Permission:** A system-defined action (e.g., `lead.create`).

### Table: `users`
- `Id` (UUID, PK)
- `TenantId` (UUID, FK)
- `Email` (VARCHAR, Unique)
- `Username` (VARCHAR, Unique)
- `FirstName`, `LastName`, `PhoneNumber` (VARCHAR)
- `PasswordHash` (VARCHAR)

### Table: `roles`
- `Id` (UUID, PK)
- `Name` (VARCHAR)
- `Description` (VARCHAR)

### Join Tables
- `user_roles`: Maps `UserId` to `RoleId`
- `role_permissions`: Maps `RoleId` to `PermissionId`

---

## SECTION 4 — ENDPOINT INVENTORY

### A. USERS

### 1. List Users
**Method:** `GET`
**Route:** `/api/v1/users`
**Authentication:** Required
**Success Response (200 OK):**
Array of `UserResponse` objects.

### 2. Get User by ID
**Method:** `GET`
**Route:** `/api/v1/users/{id}`
**Authentication:** Required
**Success Response (200 OK):**
A `UserResponse` object.

### 3. Create User
**Method:** `POST`
**Route:** `/api/v1/users`
**Authentication:** Required
**Request Body:** `CreateUserRequest`
**Success Response (201 Created):**
A `UserResponse` object.

### 4. Update User
**Method:** `PUT`
**Route:** `/api/v1/users/{id}`
**Authentication:** Required
**Request Body:** `UpdateUserRequest`
**Success Response (200 OK):**
A `UserResponse` object.

### 5. Delete User
**Method:** `DELETE`
**Route:** `/api/v1/users/{id}`
**Authentication:** Required
**Success Response (204 No Content):**

### 6. Get Current Profile
**Method:** `GET`
**Route:** `/api/v1/users/me`
**Authentication:** Required
**Success Response (200 OK):**
A `UserResponse` object representing the token holder.

### 7. Update Current Profile
**Method:** `PUT`
**Route:** `/api/v1/users/me`
**Authentication:** Required
**Request Body:** `UpdateUserRequest`
**Success Response (200 OK):**

### B. ROLES

### 8. List Roles
**Method:** `GET`
**Route:** `/api/v1/roles`
**Authentication:** Required
**Success Response (200 OK):**
Array of `RoleResponse` objects.

### 9. Get Role by ID
**Method:** `GET`
**Route:** `/api/v1/roles/{id}`
**Authentication:** Required
**Success Response (200 OK):**
A `RoleResponse` object.

### 10. Create Role
**Method:** `POST`
**Route:** `/api/v1/roles`
**Authentication:** Required
**Request Body:** `CreateRoleRequest`
**Success Response (201 Created):**
A `RoleResponse` object.

### 11. Update Role
**Method:** `PUT`
**Route:** `/api/v1/roles/{id}`
**Authentication:** Required
**Request Body:** `UpdateRoleRequest`
**Success Response (200 OK):**
A `RoleResponse` object.

### 12. Delete Role
**Method:** `DELETE`
**Route:** `/api/v1/roles/{id}`
**Authentication:** Required + Permission (`system.manage_users`)
**Success Response (204 No Content):**

### 13. List All Permissions
**Method:** `GET`
**Route:** `/api/v1/permissions`
**Authentication:** Required + Permission (`system.manage_users`)
**Description:** Returns a list of all available permissions in the system.
**Success Response (200 OK):**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "system.manage_users",
    "name": "Manage Users & Roles"
  }
]
```

---

## SECTION 5 — REQUEST/RESPONSE SCHEMAS

### Request DTOs

| DTO | Property | Type | Required |
|---|---|---|---|
| **CreateUserRequest** | FirstName | string | Yes |
| | LastName | string | Yes |
| | Email | string | Yes |
| | Username | string | Yes |
| | Password | string | Yes |
| | PhoneNumber | string | Yes |
| | RoleIds | Guid[] | Yes |
| **UpdateUserRequest** | FirstName | string | Yes |
| | LastName | string | Yes |
| | PhoneNumber | string | Yes |
| **CreateRoleRequest** | Name | string | Yes |
| | Description | string | Yes |
| | PermissionIds | Guid[] | Yes |
| **UpdateRoleRequest** | Name | string | Yes |
| | Description | string | Yes |
| | PermissionIds | Guid[] | Yes |

### Response DTOs

| DTO | Property | Type | Description |
|---|---|---|---|
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
| **RoleResponse** | Id | Guid | |
| | Name | string | |
| | Description | string | |
| **PermissionResponse**| Id | Guid | Unique Permission ID |
| | Code | string | Permission Code (e.g. `system.manage_users`) |
| | Name | string | Human-readable Name |

---

## SECTION 6 — IMPLEMENTATION GAPS

**RESOLVED GAPS:**
- ✅ Permissions endpoints: `GET /api/v1/permissions` has been added.
- ✅ `POST /api/v1/users/me/profile-image` has been fully implemented with local file storage.
- ✅ Multi-Tenancy check: `TenantId` is now explicitly extracted from the `ClaimsPrincipal` at the endpoint layer.
- ✅ Authorization Permissions: `.RequirePermission("system.manage_users")` has been applied to administrative routes.
