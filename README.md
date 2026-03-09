# Melio — Vendor Payments Platform

A modern fintech web application built with **Next.js 14**, **TypeScript**, and **Tailwind CSS** that simulates a vendor payments platform similar to Melio or Bill.com using mocked data and local API routes.

---

## Original Prompt

> Build a modern fintech web application using Next.js 14, TypeScript, and Tailwind.
>
> The app should simulate a vendor payments platform similar to Melio or Bill.com using mocked data and local API routes.
>
> Main goal: demonstrate a realistic payments workflow and financial dashboard.
>
> **Features:**
>
> 1. **Dashboard** — summary cards for total payments, pending payments, completed payments, and failed payments; recent activity feed showing payment events; charts for payment volume and status distribution
> 2. **Vendors** — vendor list table, vendor details page, payment method info (ACH or card), mock bank verification status
> 3. **Invoices** — invoice list, upload invoice (mock), invoice approval workflow, attach invoice to vendor
> 4. **Payments** — create payment, select vendor and invoice, choose payment method, schedule payment, payment status lifecycle: draft → scheduled → processing → settled → failed
> 5. **Transactions Feed** — event-style log similar to Stripe webhooks: payment.created, payment.processing, payment.settled, payment.failed
> 6. **Reconciliation Page** — table showing invoice amount vs payment amount, settlement batch grouping, highlight mismatches
>
> **Technical requirements:** Next.js App Router, TypeScript, Tailwind UI, mock REST API routes in Next.js, React Query or SWR for data fetching, component-based architecture, reusable tables and charts, realistic seeded mock data (vendors, invoices, payments)
>
> **Design:** clean fintech UI similar to Stripe, Melio, or Bill.com; sidebar navigation; professional dashboard layout; responsive design

---

## Getting Started

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Architecture

| Layer | Files | Description |
|-------|-------|-------------|
| **Types** | `src/lib/types.ts` | All domain entities (Vendor, Invoice, Payment, TransactionEvent, etc.) |
| **Mock Data** | `src/lib/mock-data.ts` | 8 vendors, 10 invoices, 8 payments, 12 events, 6 reconciliation records |
| **Utilities** | `src/lib/utils.ts` | Currency formatting, date formatting, `cn()`, status colors |
| **API Routes** | `src/app/api/` | 7 REST endpoints: vendors, invoices, payments, transactions, reconciliation, dashboard |
| **Components** | `src/components/` | Sidebar, DataTable, SummaryCard, StatusBadge, PageHeader, Providers |
| **Pages** | `src/app/` | 6 feature pages + vendor detail page |

---

## Feature Pages

### 1. Dashboard (`/`)
- 4 gradient summary cards (Total, Pending, Completed, Failed)
- Area chart showing 7-month payment volume trend
- Donut pie chart for status distribution
- Recent activity feed with event type icons

### 2. Vendors (`/vendors` + `/vendors/[id]`)
- Searchable vendor table with bank verification status badges
- Detail page with contact info, payment method, bank info, verification status
- Related invoices and payments tables per vendor

### 3. Invoices (`/invoices`)
- Filterable by status (all, pending, approved, rejected, paid)
- **Upload Invoice** modal with drag-and-drop area
- **Approval workflow** modal showing invoice details with Approve/Reject actions

### 4. Payments (`/payments`)
- **Create Payment** modal: select vendor, invoice, payment method (ACH/Card), schedule date
- **Payment detail** modal with lifecycle stepper: Draft → Scheduled → Processing → Settled
- Failed payments show error reason with red highlight

### 5. Transactions (`/transactions`)
- Stripe-style webhook event log with event type badges
- Filterable: `payment.created`, `payment.processing`, `payment.settled`, `payment.failed`
- Shows timestamp, payment ID, vendor, amount, and failure reasons

### 6. Reconciliation (`/reconciliation`)
- Summary cards: Total Records, Matched, Mismatches, Net Difference
- Settlement **batch grouping** (e.g., `BATCH-2026-0308-A`)
- Invoice amount vs payment amount comparison with **mismatch highlighting**

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data Fetching:** TanStack React Query
- **Icons:** Lucide React
- **Date Utilities:** date-fns
