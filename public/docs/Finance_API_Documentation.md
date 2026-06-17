# TECHTOPIA CRM — FINANCE & PROCUREMENT API DOCUMENTATION

## SECTION 1 — MODULE OVERVIEW

**Business Purpose:**
The Finance module is the ERP core of Techtopia CRM. It handles the complete lifecycle of money flowing in (Invoices, Revenue) and money flowing out (Expenses, Budgets, Purchase Orders). It includes a full General Ledger system for double-entry bookkeeping and Reconciliation.

**Sub-Modules:**
- **Invoices:** Billing customers, tracking payments.
- **Expenses:** Employee or corporate spend against Budgets.
- **Budgets:** Capital allocation and consumption tracking.
- **Vendors:** Managing external suppliers, quotes, and contracts.
- **Procurement:** Requisitions (PR) and Purchase Orders (PO).
- **General Ledger:** Chart of Accounts, Journal Entries, Bank Statements, Reconciliation.

---

## SECTION 2 — APPLICATION FLOW

### User Journey 1: Procurement to Pay (P2P)

**Step 1:** Employee creates a `Purchase Requisition` (PR).
`POST /api/v1/finance/purchase-requisitions`
(Status = Draft)

**Step 2:** Employee submits the PR.
`POST /api/v1/finance/purchase-requisitions/{id}/submit`
(Status = PendingApproval)

**Step 3:** Finance Manager approves PR.
`POST /api/v1/finance/purchase-requisitions/{id}/approve`
(Status = Approved)

**Step 4:** Procurement Officer solicits `VendorQuotes` against the PR and selects the winning quote.
`POST /api/v1/finance/vendor-quotes/{id}/select`
Backend *automatically* converts the PR and Quote into a `Purchase Order` (PO).

**Step 5:** Finance Manager approves the PO.
`POST /api/v1/finance/purchase-orders/{id}/approve`

### User Journey 2: Expense Consumption

**Step 1:** Administrator creates a `Budget` and allocates funds to a department.
`POST /api/v1/finance/budgets`
`POST /api/v1/finance/budgets/{id}/activate`

**Step 2:** Employee submits an `Expense` linked to the `BudgetId`.
`POST /api/v1/finance/expenses/{id}/submit`

**Step 3:** Manager approves the Expense.
`POST /api/v1/finance/expenses/{id}/approve`
Backend *automatically* deducts the expense amount from the Budget's `ConsumedAmount`.

---

## SECTION 3 — DOMAIN MODEL & DATABASE MAPPING

### Key Tables
- `invoices`, `invoice_items`, `invoice_activities`
- `expenses`, `expense_categories`, `expense_activities`
- `budgets`, `budget_allocations`
- `vendors`, `vendor_contacts`, `vendor_contracts`
- `purchase_requisitions`, `purchase_orders`, `vendor_quotes`
- `accounts` (Chart of Accounts), `journal_entries`, `journal_entry_lines`
- `bank_statements`, `bank_statement_lines`

### Relationships & Cascade Rules
- `Invoice` -> `InvoiceItems` (One to Many, Cascade Delete)
- `Budget` -> `Expenses` (One to Many, Restrict Delete)
- `Vendor` -> `VendorQuotes` (One to Many, Cascade Delete)
- `PurchaseRequisition` -> `PurchaseOrder` (One to One)

---

## SECTION 4 — ENDPOINT INVENTORY

*(Due to the sheer size of the finance module, this is a condensed inventory based on the Python E2E test suite).*

### A. INVOICES
- `GET /api/v1/finance/invoices` (`invoice.view`)
- `POST /api/v1/finance/invoices` (`invoice.create`)
- `GET /api/v1/finance/invoices/{id}` (`invoice.view`)
- `PUT /api/v1/finance/invoices/{id}` (`invoice.edit`)
- `POST /api/v1/finance/invoices/{id}/submit` (`invoice.edit`)
- `POST /api/v1/finance/invoices/{id}/approve` (`invoice.approve`)
- `POST /api/v1/finance/invoices/{id}/payments` (`invoice.payment`)
- `GET /api/v1/finance/invoices/{id}/activities` (`invoice.view`)

### B. EXPENSES & BUDGETS
- `GET /api/v1/finance/budgets` (`budget.view`)
- `POST /api/v1/finance/budgets` (`budget.create`)
- `POST /api/v1/finance/budgets/{id}/activate` (`budget.activate`)
- `POST /api/v1/finance/expenses` (`expense.create`)
- `POST /api/v1/finance/expenses/{id}/approve` (`expense.approve`)

### C. VENDORS & QUOTES
- `POST /api/v1/finance/vendors` (`vendor.create`)
- `POST /api/v1/finance/vendors/{id}/contacts` (`vendor.edit`)
- `POST /api/v1/finance/vendors/{id}/contracts` (`vendor.contract.manage`)
- `POST /api/v1/finance/vendor-quotes` (`procurement.create`)
- `POST /api/v1/finance/vendor-quotes/{id}/evaluate` (`procurement.approve`)
- `POST /api/v1/finance/vendor-quotes/{id}/select` (`procurement.approve`)

### D. PROCUREMENT (PR & PO)
- `POST /api/v1/finance/purchase-requisitions` (`procurement.create`)
- `POST /api/v1/finance/purchase-requisitions/{id}/approve` (`procurement.approve`)
- `POST /api/v1/finance/purchase-orders` (`procurement.create`)
- `POST /api/v1/finance/purchase-orders/{id}/approve` (`procurement.approve`)

### E. GENERAL LEDGER
- `GET /api/v1/finance/accounts` (`gl.view`)
- `POST /api/v1/finance/journal-entries` (`gl.manage`)
- `POST /api/v1/finance/reconciliation/statements` (`gl.manage`)
- `POST /api/v1/finance/reconciliation/lines/{lineId}/reconcile` (`gl.manage`)

---

## SECTION 5 — ENUM DOCUMENTATION

### InvoiceStatus
- `0 - Draft`: Initial state.
- `1 - Sent`: Sent to customer.
- `2 - PartiallyPaid`: Some payments recorded.
- `3 - Paid`: Fully paid.
- `4 - Overdue`: Past due date.
- `5 - Cancelled`: Voided.

### ExpenseStatus
- `0 - Draft`: Unsubmitted.
- `1 - PendingApproval`: Submitted, awaiting manager review.
- `2 - Approved`: Approved, deducting from budget.
- `3 - Rejected`: Sent back to employee.
- `4 - Paid`: Reimbursed.

### PurchaseOrderStatus
- `0 - Draft`
- `1 - PendingApproval`
- `2 - Approved`
- `3 - SentToVendor`
- `4 - PartiallyReceived`
- `5 - Received`
- `6 - Closed`

---

## SECTION 6 — IMPLEMENTATION GAPS

**MISSING IMPLEMENTATION / KNOWN QUIRKS:**
1. **Invoice Contact/Company constraints:** The `CreateInvoice` DTO expects a `companyId` pointing to the CRM `Companies` table. Since the `Companies` module is not fully implemented in the CRM, the test script relies on seeded default IDs.
2. **PurchaseOrder Auth Bug:** In `PurchaseOrderEndpoints.cs`, `.RequireAuthorization()` is missing on the parent `MapGroup`, meaning some GET endpoints might fallback to global auth or be unintentionally exposed depending on server configuration.
3. **Account Auth Bug:** Similar to POs, `AccountEndpoints.cs` does not explicitly call `.RequireAuthorization()` on the GET routes, marking them potentially open.
4. **Tenant Provider in Quotes:** `VendorQuoteEndpoints.cs` relies on an injected `ITenantProvider` to resolve the tenant context instead of extracting it directly from `ClaimsPrincipal`. If the provider is misconfigured in DI, quotes will return 401/403.
