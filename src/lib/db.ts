import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join( process.cwd(), 'melio.db' );

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
    if ( !_db ) {
        _db = new Database( DB_PATH );
        _db.pragma( 'journal_mode = WAL' );
        _db.pragma( 'foreign_keys = ON' );
        initSchema( _db );
    }
    return _db;
}

function initSchema( db: Database.Database ) {
    db.exec( `
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('ach', 'card')),
      bank_name TEXT,
      account_last4 TEXT NOT NULL,
      routing_number TEXT,
      bank_verification_status TEXT NOT NULL CHECK(bank_verification_status IN ('verified', 'pending', 'failed')),
      created_at TEXT NOT NULL,
      total_paid REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL REFERENCES vendors(id),
      vendor_name TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'approved', 'rejected', 'paid')),
      description TEXT NOT NULL,
      file_name TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      vendor_id TEXT NOT NULL REFERENCES vendors(id),
      vendor_name TEXT NOT NULL,
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      invoice_number TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('ach', 'card')),
      status TEXT NOT NULL CHECK(status IN ('draft', 'scheduled', 'processing', 'settled', 'failed')),
      scheduled_date TEXT NOT NULL,
      processed_date TEXT,
      settled_date TEXT,
      failure_reason TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transaction_events (
      id TEXT PRIMARY KEY,
      payment_id TEXT NOT NULL REFERENCES payments(id),
      type TEXT NOT NULL CHECK(type IN ('payment.created', 'payment.processing', 'payment.settled', 'payment.failed')),
      vendor_name TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      failure_reason TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reconciliation_records (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      invoice_number TEXT NOT NULL,
      payment_id TEXT NOT NULL REFERENCES payments(id),
      vendor_name TEXT NOT NULL,
      invoice_amount REAL NOT NULL,
      payment_amount REAL NOT NULL,
      difference REAL NOT NULL,
      matched INTEGER NOT NULL DEFAULT 1,
      batch_id TEXT NOT NULL,
      settled_date TEXT NOT NULL
    );
  `);
}

// ─── Row → camelCase mappers ───────────────────────────────────────

export function mapVendor( row: Record<string, unknown> ) {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        paymentMethod: row.payment_method,
        bankName: row.bank_name,
        accountLast4: row.account_last4,
        routingNumber: row.routing_number,
        bankVerificationStatus: row.bank_verification_status,
        createdAt: row.created_at,
        totalPaid: row.total_paid,
    };
}

export function mapInvoice( row: Record<string, unknown> ) {
    return {
        id: row.id,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        invoiceNumber: row.invoice_number,
        amount: row.amount,
        dueDate: row.due_date,
        status: row.status,
        description: row.description,
        fileName: row.file_name,
        createdAt: row.created_at,
    };
}

export function mapPayment( row: Record<string, unknown> ) {
    return {
        id: row.id,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        invoiceId: row.invoice_id,
        invoiceNumber: row.invoice_number,
        amount: row.amount,
        paymentMethod: row.payment_method,
        status: row.status,
        scheduledDate: row.scheduled_date,
        processedDate: row.processed_date,
        settledDate: row.settled_date,
        failureReason: row.failure_reason,
        createdAt: row.created_at,
    };
}

export function mapTransactionEvent( row: Record<string, unknown> ) {
    return {
        id: row.id,
        paymentId: row.payment_id,
        type: row.type,
        data: {
            vendorName: row.vendor_name,
            amount: row.amount,
            paymentMethod: row.payment_method,
            status: row.status,
            failureReason: row.failure_reason || undefined,
        },
        timestamp: row.timestamp,
    };
}

export function mapReconciliation( row: Record<string, unknown> ) {
    return {
        id: row.id,
        invoiceId: row.invoice_id,
        invoiceNumber: row.invoice_number,
        paymentId: row.payment_id,
        vendorName: row.vendor_name,
        invoiceAmount: row.invoice_amount,
        paymentAmount: row.payment_amount,
        difference: row.difference,
        matched: Boolean( row.matched ),
        batchId: row.batch_id,
        settledDate: row.settled_date,
    };
}
