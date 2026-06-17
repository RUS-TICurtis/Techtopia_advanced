# TECHTOPIA CRM — SALES API DOCUMENTATION

## SECTION 1 — MODULE OVERVIEW

**Business Purpose:**
The Sales Management module handles the core entities resulting from Lead Conversion: `Contacts`, `Companies`, and `Opportunities`, as well as configuration for `LeadSources`. This module represents the downstream CRM pipeline after initial prospecting.

**Architecture & Flow:**
- Database Mapping: Uses EF Core over `Companies`, `Contacts`, `Opportunities`, and `LeadSources` tables.
- Isolation: All records are strictly tenant-isolated using the `TenantId` column and EF Core Global Query Filters.
- Event Driven: The Leads module converts Leads into these entities via `LeadConvertedEvent` published through `MediatR`.

---

## SECTION 2 — APPLICATION FLOW

**Step 1: Data Origination**
Sales records generally originate from the `/api/v1/leads/{id}/convert` endpoint, which creates a `Contact`, `Company`, and `Opportunity` simultaneously.

**Step 2: Configuration**
`LeadSources` can be dynamically configured by administrators to track where leads/contacts are originating (e.g. "Trade Show", "Website").

**Step 3: Pipeline Management**
Users can update the `Opportunity` stage, modify amounts, and adjust the `CloseDate` as the deal progresses.

---

## SECTION 3 — ENDPOINT REFERENCE

### Companies Endpoints
**Base Path:** `GET /api/v1/crm/companies`
- **GET `/`**
  - **Purpose:** Lists all companies for the current tenant.
  - **Returns:** `200 OK` with an array of `CompanyDto`.

- **GET `/{id}`**
  - **Purpose:** Fetches a single company.
  - **Returns:** `200 OK` or `404 Not Found`.

- **POST `/`**
  - **Purpose:** Creates a new company.
  - **Returns:** `201 Created`.

- **PUT `/{id}`**
  - **Purpose:** Updates an existing company.
  - **Returns:** `200 OK` or `404 Not Found`.

- **DELETE `/{id}`**
  - **Purpose:** Deletes a company.
  - **Returns:** `204 No Content` or `404 Not Found`.

### Contacts Endpoints
**Base Path:** `GET /api/v1/crm/contacts`
- **GET `/`**
  - **Purpose:** Lists all contacts for the current tenant.
  - **Returns:** `200 OK` with an array of `ContactDto`.

- **GET `/{id}`**
  - **Purpose:** Fetches a single contact.
  - **Returns:** `200 OK` or `404 Not Found`.

- **POST `/`**
  - **Purpose:** Creates a new contact.
  - **Returns:** `201 Created`.

- **PUT `/{id}`**
  - **Purpose:** Updates an existing contact.
  - **Returns:** `200 OK` or `404 Not Found`.

- **DELETE `/{id}`**
  - **Purpose:** Deletes a contact.
  - **Returns:** `204 No Content` or `404 Not Found`.

### Opportunities Endpoints
**Base Path:** `GET /api/v1/crm/opportunities`
- **GET `/`**
  - **Purpose:** Lists all opportunities for the current tenant.
  - **Returns:** `200 OK` with an array of `OpportunityDto`.

- **GET `/{id}`**
  - **Purpose:** Fetches a single opportunity.
  - **Returns:** `200 OK` or `404 Not Found`.

- **POST `/`**
  - **Purpose:** Creates a new opportunity.
  - **Returns:** `201 Created`.

- **PUT `/{id}`**
  - **Purpose:** Updates an existing opportunity.
  - **Returns:** `200 OK` or `404 Not Found`.

- **DELETE `/{id}`**
  - **Purpose:** Deletes an opportunity.
  - **Returns:** `204 No Content` or `404 Not Found`.

### Lead Sources Endpoints
**Base Path:** `GET /api/v1/crm/lead-sources`
- **GET `/`**
  - **Purpose:** Lists all lead sources for the current tenant.
  - **Returns:** `200 OK` with an array of `LeadSourceDto`.

- **GET `/{id}`**
  - **Purpose:** Fetches a single lead source.
  - **Returns:** `200 OK` or `404 Not Found`.

- **POST `/`**
  - **Purpose:** Creates a new lead source.
  - **Returns:** `201 Created`.

- **PUT `/{id}`**
  - **Purpose:** Updates an existing lead source.
  - **Returns:** `200 OK` or `404 Not Found`.

- **DELETE `/{id}`**
  - **Purpose:** Deletes a lead source.
  - **Returns:** `204 No Content` or `404 Not Found`.

---

## SECTION 4 — EVENT DRIVEN ARCHITECTURE
When a Lead is converted (`POST /api/v1/leads/{id}/convert`), a `LeadConvertedEvent` is dispatched via `MediatR` which can be consumed by other bounded contexts asynchronously.
