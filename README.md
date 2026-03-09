# Melio — Vendor Payments Platform

A modern fintech web application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **SQLite** that simulates a vendor payments platform similar to Melio or Bill.com.

---

## Overview

The application simulates a vendor payments platform using mock data and local API routes, demonstrating a realistic payments workflow and financial dashboard.

### Core Features

1. **Dashboard** — summary cards for total payments, pending payments, completed payments, and failed payments; recent activity feed showing payment events; charts for payment volume and status distribution
2. **Vendors** — vendor list table, vendor details page, payment method info (ACH or card), mock bank verification status
3. **Invoices** — invoice list, mock invoice upload, invoice approval workflow, attach invoice to vendor
4. **Payments** — create payment, select vendor and invoice, choose payment method, schedule payment, payment status lifecycle: draft → scheduled → processing → settled → failed
5. **Transactions Feed** — event-style log similar to Stripe webhooks tracking payment lifecycle events
6. **Reconciliation Page** — table showing invoice amount vs payment amount, settlement batch grouping, highlight mismatches
7. **Fraud Monitor** — suspicious activity detection, risk scoring rules engine, flagged transactions table, vendor risk profiling
8. **Dev Console** — mock developer API console for generating API keys, simulating payments, viewing request logs, and triggering mock webhooks
9. **Partner Portal** — simulator for onboarding external partners, monitoring their API usage, managing webhook connections, and rotating partner API keys

### Design & Architecture

The application features a clean, professional fintech UI with sidebar navigation and responsive layouts. It utilizes component-based architecture with reusable tables and charts, and is powered by realistic seeded SQLite database records fetched via local Next.js API Routes.

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
| **Seed Script** | `scripts/seed.ts` | Generates ~30 vendors, ~100 invoices, ~65 payments, ~150 events, ~40 fraud alerts |
| **Types** | `src/lib/types.ts` | All domain entities (Vendor, Invoice, Payment, TransactionEvent, etc.) |
| **Utilities** | `src/lib/utils.ts` | Currency formatting, date formatting, `cn()`, status colors |
| **API Routes** | `src/app/api/` | REST endpoints querying SQLite (including fraud-monitor, dev-console) |
| **Components** | `src/components/` | Sidebar, DataTable, SummaryCard, StatusBadge, PageHeader, ThemeProvider, RiskScoreBar |
| **Pages** | `src/app/` | 9 feature pages + vendor & partner detail pages |

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

### 7. Fraud Monitor (`/fraud-monitor`)

- 4 summary cards: Total Flagged, High Risk, Pending Review, Cleared Today
- Area chart for 30-day risk trend and Bar chart for rule trigger statistics
- Suspicious payments table with search, risk filters, and color-coded risk score bars
- Detail modal showing risk assessment gauge, payment info, triggered rules, vendor risk profile, and transaction history
- Modular rules engine evaluating payments against customizable fraud patterns (e.g. High Amount, Rapid Payments)

### 8. Dev Console (`/dev-console`)

- **API Keys**: mock key generation UI, publishable/secret key display, and rotation
- **Payment API Simulator**: request building form for `/api/dev/payments` auto-filling the active secret key, with dark-themed JSON request and response viewers
- **API Logs**: table of developer API requests with latency and status, featuring expandable rows revealing the exact request/response JSON payloads
- **Webhook Simulator**: dispatch mock Stripe-style lifecycle events (e.g., `payment.succeeded`) and view simulated delivery logs with a retry mechanism

### 9. Partner Portal (`/partner-portal`)

- **Partner Directory**: table of integrated partners (e.g., Capital One, Stripe) displaying integration health and API usage stats
- **Partner Dashboard (`/[id]`)**: detailed view featuring Recharts-powered graphs for 30-day API Requests (`requests`) and Latency (`latency_ms`) vs Errors
- **API Keys & Webhooks**: interactive Client Components with Server Actions for securely rotating keys and registering webhook endpoint subscriptions

---

## Database

All data is stored in a local **SQLite** database (`melio.db`) via `better-sqlite3`. The API routes run SQL queries directly — no ORM overhead.

The seed script (`scripts/seed.ts`) programmatically generates randomized but realistic data including:

- 30 vendors with ACH/card payment methods and bank verification statuses
- ~100+ invoices across all vendors with varying statuses
- ~65 payments spanning the full lifecycle (draft → settled / failed)
- ~150+ transaction events (webhook-style lifecycle logs)
- ~40 reconciliation records grouped into settlement batches
- ~40+ fraud alerts generated by evaluated seeded payments against a simulated rules engine

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
