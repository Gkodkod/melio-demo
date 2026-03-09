# Melio — Vendor Payments Platform

A modern fintech web application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **SQLite** that simulates a vendor payments platform similar to Melio or Bill.com.

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
npx tsx scripts/seed.ts   # seed the SQLite database
npm run dev               # → http://localhost:3000
```

To re-seed the database with fresh randomized data at any time:

```bash
npx tsx scripts/seed.ts
```

---

## Architecture

| Layer | Files | Description |
| ----- | ----- | ----------- |
| **Database** | `src/lib/db.ts` | SQLite connection, schema init, row-to-camelCase mappers |
| **Seed Script** | `scripts/seed.ts` | Generates ~30 vendors, ~100 invoices, ~65 payments, ~150 events |
| **Types** | `src/lib/types.ts` | All domain entities (Vendor, Invoice, Payment, TransactionEvent, etc.) |
| **Utilities** | `src/lib/utils.ts` | Currency formatting, date formatting, `cn()`, status colors |
| **API Routes** | `src/app/api/` | 7 REST endpoints querying SQLite |
| **Components** | `src/components/` | Sidebar, DataTable, SummaryCard, StatusBadge, PageHeader, ThemeProvider |
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

## Database

All data is stored in a local **SQLite** database (`melio.db`) via `better-sqlite3`. The API routes run SQL queries directly — no ORM overhead.

The seed script (`scripts/seed.ts`) programmatically generates randomized but realistic data including:

- 30 vendors with ACH/card payment methods and bank verification statuses
- ~100+ invoices across all vendors with varying statuses
- ~65 payments spanning the full lifecycle (draft → settled / failed)
- ~150+ transaction events (webhook-style lifecycle logs)
- ~40 reconciliation records grouped into settlement batches

---

## Theme Toggle

The app ships with a **dark/light theme toggle** in the sidebar. The theme preference is persisted in `localStorage` and applied via CSS custom properties with a `data-theme` attribute on the root element.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite via better-sqlite3
- **Charts:** Recharts
- **Data Fetching:** TanStack React Query
- **Icons:** Lucide React
- **Date Utilities:** date-fns
