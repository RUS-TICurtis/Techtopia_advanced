# TECHTOPIA CRM — LEADS API DOCUMENTATION

## SECTION 1 — MODULE OVERVIEW

**Business Purpose:**
The Lead Management module is the entry point for the CRM sales process. It manages prospective customers (Leads), tracks activities/notes against them, scores them via BANT qualification (Budget, Authority, Need, Timeline), and converts them into Contacts, Companies, and Opportunities once qualified.

**Architecture & Flow:**
- Database Mapping: The `crm_leads`, `crm_lead_notes`, and `crm_lead_activities` tables store the data.
- Domain Driven Design (DDD): `LeadEntity` models behavior such as `AssignTo`, `AddNote`, `AddActivity`, `QualifyBant`, and `ConvertToOpportunity`.
- Permissions: Relies on `lead.view`, `lead.create`, `lead.edit`, `lead.delete`, `lead.assign`, `lead.qualify`, `lead.convert`.

---

## SECTION 2 — APPLICATION FLOW

### User Journey: Complete Lead Lifecycle

**Step 1: Lead Entry**
Frontend displays "New Lead" form. Sales Rep submits data.
`POST /api/v1/leads` (Required: `lead.create`)

**Step 2: Tracking Interaction**
Rep calls the lead.
`POST /api/v1/leads/{id}/activities` (Type: Call)

Rep leaves a summary note.
`POST /api/v1/leads/{id}/notes` (Content: "Spoke with prospect...")

**Step 3: Lead Qualification**
Rep uses BANT criteria to qualify the lead.
`POST /api/v1/leads/{id}/qualify` 
Body: `{ hasBudget: true, isDecisionMaker: true, hasNeed: true, hasTimeline: false }`
Backend calculates `QualificationScore` (e.g. 75/100).

**Step 4: Conversion**
The lead is deemed ready for the sales pipeline. Rep converts them.
`POST /api/v1/leads/{id}/convert` 
Backend automatically spins up a `Contact`, `Company`, and `Opportunity`, and marks the lead as `Converted`.

---

## SECTION 3 — DOMAIN MODEL & DATABASE MAPPING

### Entities
- **LeadEntity:** The core lead record.
- **LeadNote:** Textual notes attached to a lead.
- **LeadActivity:** Structured interactions (Calls, Meetings, Emails).

### Table: `crm_leads`
- `Id` (UUID, PK)
- `TenantId` (UUID, FK)
- `LeadNumber` (VARCHAR, Auto-generated string like L-1000)
- `FirstName`, `LastName`, `Email`, `Phone`, `CompanyName`, `JobTitle`
- `Status` (INT Enum)
- `Priority` (INT Enum)
- `QualificationScore` (INT)
- `AssignedToId` (UUID, FK to `users`)

### Table: `crm_lead_notes` & `crm_lead_activities`
Both contain standard tracking fields, an FK to `LeadId`, an FK to `CreatedById` (the user who made the note), and timestamp fields.

---

## SECTION 4 — ENDPOINT INVENTORY

### 1. List Leads
**Method:** `GET`
**Route:** `/api/v1/leads`
**Permission:** `lead.view`
**Response:** `LeadResponse[]`

### 2. Get Lead by ID
**Method:** `GET`
**Route:** `/api/v1/leads/{id}`
**Permission:** `lead.view`
**Response:** `LeadResponse`

### 3. Create Lead
**Method:** `POST`
**Route:** `/api/v1/leads`
**Permission:** `lead.create`
**Request Body:** `CreateLeadRequest`
**Response:** `201 Created` with `LeadResponse`

### 4. Update Lead
**Method:** `PUT`
**Route:** `/api/v1/leads/{id}`
**Permission:** `lead.edit`
**Request Body:** `UpdateLeadRequest`
**Response:** `LeadResponse`

### 5. Delete Lead
**Method:** `DELETE`
**Route:** `/api/v1/leads/{id}`
**Permission:** `lead.delete`
**Response:** `204 No Content`

### 6. Assign Lead
**Method:** `POST`
**Route:** `/api/v1/leads/{id}/assign`
**Permission:** `lead.assign`
**Request Body:** `AssignLeadRequest`
**Response:** `LeadResponse`

### 7. Qualify Lead
**Method:** `POST`
**Route:** `/api/v1/leads/{id}/qualify`
**Permission:** `lead.qualify`
**Request Body:** `QualifyLeadRequest`
**Response:** `LeadResponse`

### 8. Convert Lead
**Method:** `POST`
**Route:** `/api/v1/leads/{id}/convert`
**Permission:** `lead.convert`
**Request Body:** `ConvertLeadRequest`
**Response:** `LeadResponse` (or converted entity representation)

### 9. Get Lead Dashboard
**Method:** `GET`
**Route:** `/api/v1/leads/dashboard`
**Permission:** `lead.view`
**Response:** `LeadDashboardResponse`

### 10. Notes & Activities
- `GET /api/v1/leads/{id}/notes`
- `POST /api/v1/leads/{id}/notes` (Req: `CreateLeadNoteRequest`)
- `GET /api/v1/leads/{id}/activities`
- `POST /api/v1/leads/{id}/activities` (Req: `CreateLeadActivityRequest`)

---

## SECTION 5 — REQUEST/RESPONSE SCHEMAS

### Request DTOs

| DTO | Property | Type | Required |
|---|---|---|---|
| **CreateLeadRequest** | FirstName | string | Yes |
| | LastName | string | Yes |
| | Email | string | No |
| | Phone | string | No |
| | CompanyName | string | No |
| | Priority | LeadPriority Enum | Yes |
| | EstimatedValue | decimal | Yes |
| **AssignLeadRequest** | AssignedToId | Guid | Yes |
| **QualifyLeadRequest**| HasBudget | bool | Yes |
| | IsDecisionMaker | bool | Yes |
| | HasNeed | bool | Yes |
| | HasTimeline | bool | Yes |
| **ConvertLeadRequest**| CompanyName | string | Yes |
| | OpportunityName | string | Yes |

### Response DTOs

| DTO | Property | Type | Description |
|---|---|---|---|
| **LeadResponse** | Id | Guid | |
| | LeadNumber | string | Auto-generated ID |
| | Status | LeadStatus Enum | |
| | Priority | LeadPriority Enum| |
| | QualificationScore | int | Computed BANT Score |
| | AssignedToName | string | Name of assigned user |
| **LeadDashboardResponse** | TotalLeads | int | |
| | NewLeads | int | |
| | QualifiedLeads | int | |
| | ConvertedLeads | int | |
| | ConversionRate | decimal | % of total converted |

---

## SECTION 6 — ENUM DOCUMENTATION

### LeadStatus
| Value | Meaning |
|---|---|
| 0 - New | Lead just entered the system |
| 1 - Contacted | Sales rep has initiated contact |
| 2 - Qualified | BANT criteria met |
| 3 - Converted | Successfully converted to an Opportunity |
| 4 - Lost | Disqualified or uninterested |

### LeadPriority
| Value | Meaning |
|---|---|
| 0 - Low | Long-term nurture |
| 1 - Medium | Standard priority |
| 2 - High | Immediate follow-up required |

### ActivityType
| Value | Meaning |
|---|---|
| 0 - Call | Phone interaction |
| 1 - Email | Digital communication |
| 2 - Meeting | In-person or virtual sit-down |
| 3 - Note | Manual system note |

---

## SECTION 7 — IMPLEMENTATION GAPS

**MISSING IMPLEMENTATION:**
- `ConvertLeadRequest` asks for `CompanyName` and `OpportunityName`, but the underlying `Contacts`, `Companies`, and `Opportunities` endpoints/modules do not currently exist in the codebase. Therefore, the actual conversion logic will fail or stub out downstream creation.
- `SourceId` is part of `CreateLeadRequest` but there is no `LeadSources` module or endpoint to fetch these sources.
- Event Driven Architecture: `ConvertLead` does not currently publish a domain event (e.g. `LeadConvertedEvent`) to an event bus (like RabbitMQ or Azure Service Bus), despite the architecture implying CQRS/Events. 
