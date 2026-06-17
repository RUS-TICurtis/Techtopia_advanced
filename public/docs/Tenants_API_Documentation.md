# TECHTOPIA CRM — TENANTS API DOCUMENTATION

## SECTION 1 — MODULE OVERVIEW

**Business Purpose:**
The Tenants module handles the core isolation boundary of the CRM. Since the system uses a Multi-Tenant Architecture, every customer organization gets its own `Tenant`. The system assigns all users, leads, finances, and operational data to a specific tenant. This module allows system administrators to manage these root tenant entities.

**Architecture & Flow:**
- Database Mapping: The `Tenants` table is at the very root of the domain hierarchy.
- Authorization: Endpoints are tightly restricted and require the `system.manage_tenants` permission.
- Deletion: Deleting a tenant cascades down (or leaves orphaned data if soft-deleted, depending on EF configuration).

---

## SECTION 2 — APPLICATION FLOW

### User Journey: Tenant Onboarding

**Step 1:**
System Admin logs into the master dashboard.

**Step 2:**
Admin views the list of tenants via:
`GET /api/v1/system/tenants`

**Step 3:**
Admin creates a new tenant for a customer organization:
`POST /api/v1/system/tenants` (Providing Name and Slug)

**Step 4:**
Backend creates the `Tenant` record in PostgreSQL.

**Step 5:**
The system returns a `201 Created` with the new Tenant ID.

**Step 6:**
The customer organization is now onboarded and can have Users and Roles assigned to their specific TenantId.

---

## SECTION 3 — DOMAIN MODEL & DATABASE MAPPING

### Entities
- **Tenant:** Represents an isolated customer workspace in the CRM.

### Table: `tenants`
- `Id` (UUID, PK)
- `Name` (VARCHAR)
- `Slug` (VARCHAR, Unique identifier usually used in subdomains)
- `IsActive` (BOOLEAN)
- `CreatedAt` (TIMESTAMP)

---

## SECTION 4 — ENDPOINT INVENTORY

### 1. List Tenants

**Method:** `GET`
**Route:** `/api/v1/system/tenants`
**Authentication:** Required (`Authorization: Bearer {token}`)
**Permission:** `system.manage_tenants`

**Success Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "isActive": true
  }
]
```

---

### 2. Get Tenant by ID

**Method:** `GET`
**Route:** `/api/v1/system/tenants/{id}`
**Authentication:** Required (`Authorization: Bearer {token}`)
**Permission:** `system.manage_tenants`

**Success Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "isActive": true
}
```

**Error Responses:**
- `404 Not Found` (If tenant does not exist)

---

### 3. Create Tenant

**Method:** `POST`
**Route:** `/api/v1/system/tenants`
**Authentication:** Required (`Authorization: Bearer {token}`)
**Permission:** `system.manage_tenants`

**Request Body:**
```json
{
  "name": "Global Tech",
  "slug": "global-tech"
}
```

**Validation Rules:**
- `Name`: Required
- `Slug`: Required

**Success Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Global Tech",
  "slug": "global-tech",
  "isActive": true
}
```

**Error Responses:**
- `400 Bad Request` (Validation or duplicate slug)

---

### 4. Update Tenant

**Method:** `PUT`
**Route:** `/api/v1/system/tenants/{id}`
**Authentication:** Required (`Authorization: Bearer {token}`)
**Permission:** `system.manage_tenants`

**Request Body:**
```json
{
  "name": "Global Tech Inc.",
  "slug": "global-tech-inc",
  "isActive": false
}
```

**Validation Rules:**
- `Name`: Required
- `Slug`: Required
- `IsActive`: Required (Boolean)

**Success Response (204 No Content):**
No body returned.

**Error Responses:**
- `400 Bad Request`

---

### 5. Delete Tenant

**Method:** `DELETE`
**Route:** `/api/v1/system/tenants/{id}`
**Authentication:** Required (`Authorization: Bearer {token}`)
**Permission:** `system.manage_tenants`

**Success Response (204 No Content):**
No body returned.

**Error Responses:**
- `400 Bad Request`

---

## SECTION 5 — REQUEST/RESPONSE SCHEMAS

### Request DTOs

| DTO | Property | Type | Required | Notes |
|---|---|---|---|---|
| **CreateTenantDto** | Name | string | Yes | |
| | Slug | string | Yes | |
| **UpdateTenantDto** | Name | string | Yes | |
| | Slug | string | Yes | |
| | IsActive | bool | Yes | |

### Response DTOs

| DTO | Property | Type | Description |
|---|---|---|---|
| **TenantDto** | Id | Guid | Unique Tenant ID |
| | Name | string | Customer Organization Name |
| | Slug | string | Organization Slug/Handle |
| | IsActive | bool | Whether the tenant is active |

---

## SECTION 6 — IMPLEMENTATION GAPS

**MISSING IMPLEMENTATION:**
- No endpoints currently exist for `GET /api/v1/system/tenants/{id}/users` to view all users explicitly belonging to a specific tenant from the system level.
- No automated provisioning of standard Chart of Accounts or default Expense Categories upon creating a *new* tenant (this is currently only done in `DbSeeder.cs` for the *default* tenant).
- Soft deletion is not explicitly modeled in the endpoints; `DELETE` performs a hard removal or cascade.
