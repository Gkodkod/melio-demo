/**
 * Seed script — generates a large, realistic dataset and inserts it into SQLite.
 *
 * Run: npx tsx scripts/seed.ts
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join( process.cwd(), 'melio.db' );

// ─── Helpers ───────────────────────────────────────────────────────

function randomPick<T>( arr: T[] ): T {
    return arr[Math.floor( Math.random() * arr.length )];
}

function randomBetween( min: number, max: number ): number {
    return Math.round( ( Math.random() * ( max - min ) + min ) * 100 ) / 100;
}

function pad( n: number, len = 4 ): string {
    return String( n ).padStart( len, '0' );
}

function isoDate( d: Date ): string {
    return d.toISOString();
}

function addDays( d: Date, days: number ): Date {
    const r = new Date( d );
    r.setDate( r.getDate() + days );
    return r;
}

function addHours( d: Date, hours: number ): Date {
    const r = new Date( d );
    r.setHours( r.getHours() + hours );
    return r;
}

// ─── Data pools ────────────────────────────────────────────────────

const companyNames = [
    'Acme Supplies Co.', 'CloudHost Services', 'Delta Logistics', 'Fresh Office Catering',
    'Greenfield Legal LLP', 'PixelCraft Design', 'SecureIT Solutions', 'TrueNorth Marketing',
    'Apex Industrial', 'BrightWave Analytics', 'Cascade Engineering', 'DataVault Systems',
    'EcoPrint Solutions', 'Falcon Transport', 'GlobeLink Telecom', 'HorizonTech Labs',
    'Ironclad Insurance', 'JetStream Couriers', 'Keystone Consulting', 'LunarEdge Software',
    'MetroClean Services', 'NovaPay Financial', 'Onyx Security Group', 'PrimePath Advisors',
    'QuickBridge Capital', 'RedOak Construction', 'SilverLine HR', 'Titanium Cloud',
    'UrbanNest Interiors', 'VoltAge Electric',
];

const emailDomains = [
    'acmesupplies.com', 'cloudhost.io', 'deltalogistics.com', 'freshcatering.com',
    'greenfieldlaw.com', 'pixelcraft.design', 'secureit.dev', 'truenorthagency.com',
    'apexind.com', 'brightwave.io', 'cascadeeng.com', 'datavault.systems',
    'ecoprint.co', 'falcontransport.net', 'globelink.tel', 'horizontech.labs',
    'ironcladins.com', 'jetstream.co', 'keystoneconsult.com', 'lunaredge.dev',
    'metroclean.com', 'novapay.finance', 'onyxsecurity.com', 'primepathadv.com',
    'quickbridge.capital', 'redoakbuild.com', 'silverlinehr.com', 'titaniumcloud.io',
    'urbannest.co', 'voltage-elec.com',
];

const cities = [
    'San Francisco, CA 94105', 'New York, NY 10166', 'Chicago, IL 60661',
    'Oakland, CA 94612', 'Boston, MA 02110', 'Portland, OR 97209',
    'Austin, TX 78701', 'Seattle, WA 98101', 'Denver, CO 80202',
    'Miami, FL 33131', 'Atlanta, GA 30303', 'Nashville, TN 37203',
    'Phoenix, AZ 85004', 'Minneapolis, MN 55402', 'San Diego, CA 92101',
];

const bankNames = [
    'Chase Business', 'Silicon Valley Bank', 'Wells Fargo', 'Bank of America',
    'Frost Bank', 'KeyBank', 'US Bank', 'PNC Business', 'TD Bank',
    'Citizens Bank', 'Capital One Business', 'First Republic',
];

const invoiceDescriptions = [
    'Q1 office supplies bulk order', 'Monthly cloud infrastructure hosting',
    'Freight shipping — pallets to warehouse', 'Team lunch catering sessions',
    'Legal advisory & contract review', 'Brand refresh — logo & style guide',
    'Annual SOC 2 compliance audit', 'Digital marketing campaign',
    'Ergonomic furniture order', 'GPU compute add-on hosting',
    'Network security assessment', 'Employee training materials',
    'Print marketing collateral', 'Data center colocation fees',
    'Software license renewal', 'Insurance premium — Q2',
    'Fleet vehicle maintenance', 'Office renovation — Phase 1',
    'Accounting software subscription', 'Payroll processing fees',
    'Customer support tooling', 'API integration consulting',
    'Warehouse rental — monthly', 'IT equipment procurement',
    'Legal filing — trademark', 'Social media management',
    'Video production — product demos', 'Travel booking platform fees',
    'Cleaning service — weekly', 'Electricity — office complex',
];

const failureReasons = [
    'Bank verification failed — card declined',
    'Insufficient funds in linked account',
    'ACH return — account not found (R03)',
    'Payment reversed by receiving bank',
    'Vendor bank account closed',
    'Transaction limit exceeded',
];

// ─── Generate data ─────────────────────────────────────────────────

interface Vendor {
    id: string; name: string; email: string; phone: string; address: string;
    payment_method: string; bank_name: string | null; account_last4: string;
    routing_number: string | null; bank_verification_status: string;
    created_at: string; total_paid: number;
}

interface Invoice {
    id: string; vendor_id: string; vendor_name: string; invoice_number: string;
    amount: number; due_date: string; status: string; description: string;
    file_name: string | null; created_at: string;
}

interface Payment {
    id: string; vendor_id: string; vendor_name: string; invoice_id: string;
    invoice_number: string; amount: number; payment_method: string; status: string;
    scheduled_date: string; processed_date: string | null; settled_date: string | null;
    failure_reason: string | null; created_at: string;
}

interface TransactionEvent {
    id: string; payment_id: string; type: string; vendor_name: string;
    amount: number; payment_method: string; status: string;
    failure_reason: string | null; timestamp: string;
}

interface ReconciliationRecord {
    id: string; invoice_id: string; invoice_number: string; payment_id: string;
    vendor_name: string; invoice_amount: number; payment_amount: number;
    difference: number; matched: number; batch_id: string; settled_date: string;
}

interface FraudAlertRow {
    id: string; payment_id: string; vendor_id: string; vendor_name: string;
    amount: number; risk_score: number; risk_level: string;
    triggered_rules: string; status: string; flagged_at: string;
}

// Generate vendors
const vendors: Vendor[] = companyNames.map( ( name, i ) => {
    const method = Math.random() > 0.3 ? 'ach' : 'card';
    const verified = Math.random();
    return {
        id: `v-${pad( i + 1, 3 )}`,
        name,
        email: `billing@${emailDomains[i]}`,
        phone: `(${randomBetween( 200, 999 ).toFixed( 0 )}) 555-${pad( Math.floor( Math.random() * 10000 ), 4 )}`,
        address: `${Math.floor( Math.random() * 2000 ) + 100} Main St, ${randomPick( cities )}`,
        payment_method: method,
        bank_name: method === 'ach' ? randomPick( bankNames ) : null,
        account_last4: pad( Math.floor( Math.random() * 10000 ), 4 ),
        routing_number: method === 'ach' ? `0${pad( Math.floor( Math.random() * 100000000 ), 8 )}` : null,
        bank_verification_status: verified > 0.2 ? 'verified' : verified > 0.1 ? 'pending' : 'failed',
        created_at: isoDate( addDays( new Date( '2025-01-01' ), Math.floor( Math.random() * 400 ) ) ),
        total_paid: 0, // will be computed after payments
    };
} );

// Generate invoices — ~3 per vendor = ~90 total
const invoices: Invoice[] = [];
let invCounter = 1;
const invoicePrefixes = ['INV', 'CH', 'DL', 'FOC', 'GL', 'PCD', 'SIS', 'TN', 'APX', 'BW'];
const invoiceStatuses = ['pending', 'approved', 'approved', 'approved', 'paid', 'rejected'];

for ( const vendor of vendors ) {
    const count = Math.floor( Math.random() * 4 ) + 2; // 2-5 invoices per vendor
    for ( let j = 0; j < count; j++ ) {
        const prefix = randomPick( invoicePrefixes );
        const amount = randomBetween( 500, 35000 );
        const createdDate = addDays( new Date( '2025-06-01' ), Math.floor( Math.random() * 250 ) );
        const status = randomPick( invoiceStatuses );
        invoices.push( {
            id: `inv-${pad( invCounter, 3 )}`,
            vendor_id: vendor.id,
            vendor_name: vendor.name,
            invoice_number: `${prefix}-2026-${pad( invCounter )}`,
            amount,
            due_date: isoDate( addDays( createdDate, Math.floor( Math.random() * 30 ) + 14 ) ),
            status,
            description: randomPick( invoiceDescriptions ),
            file_name: Math.random() > 0.3 ? `${vendor.name.toLowerCase().replace( /[^a-z]/g, '_' )}_${invCounter}.pdf` : null,
            created_at: isoDate( createdDate ),
        } );
        invCounter++;
    }
}

// Generate payments — one per approved/paid invoice
const payments: Payment[] = [];
const paymentStatuses = ['draft', 'scheduled', 'processing', 'settled', 'settled', 'settled', 'failed'];
let payCounter = 1;

for ( const invoice of invoices ) {
    if ( invoice.status !== 'approved' && invoice.status !== 'paid' ) continue;
    const vendor = vendors.find( ( v ) => v.id === invoice.vendor_id )!;
    const status = randomPick( paymentStatuses );
    const createdDate = new Date( invoice.created_at );
    const scheduledDate = addDays( createdDate, Math.floor( Math.random() * 10 ) + 1 );
    const processedDate = ['processing', 'settled', 'failed'].includes( status )
        ? addHours( scheduledDate, Math.floor( Math.random() * 8 ) + 1 ) : null;
    const settledDate = status === 'settled'
        ? addHours( processedDate!, Math.floor( Math.random() * 12 ) + 4 ) : null;

    const payment: Payment = {
        id: `pay-${pad( payCounter, 3 )}`,
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        payment_method: vendor.payment_method,
        status,
        scheduled_date: isoDate( scheduledDate ),
        processed_date: processedDate ? isoDate( processedDate ) : null,
        settled_date: settledDate ? isoDate( settledDate ) : null,
        failure_reason: status === 'failed' ? randomPick( failureReasons ) : null,
        created_at: isoDate( addDays( createdDate, -1 ) ),
    };
    payments.push( payment );
    payCounter++;
}

// Compute vendor total_paid
for ( const vendor of vendors ) {
    vendor.total_paid = payments
        .filter( ( p ) => p.vendor_id === vendor.id && p.status === 'settled' )
        .reduce( ( sum, p ) => sum + p.amount, 0 );
}

// Generate transaction events — lifecycle events for each payment
const events: TransactionEvent[] = [];
let evtCounter = 1;

for ( const payment of payments ) {
    // payment.created
    events.push( {
        id: `evt-${pad( evtCounter++, 4 )}`,
        payment_id: payment.id,
        type: 'payment.created',
        vendor_name: payment.vendor_name,
        amount: payment.amount,
        payment_method: payment.payment_method,
        status: 'scheduled',
        failure_reason: null,
        timestamp: payment.created_at,
    } );

    if ( ['processing', 'settled', 'failed'].includes( payment.status ) && payment.processed_date ) {
        events.push( {
            id: `evt-${pad( evtCounter++, 4 )}`,
            payment_id: payment.id,
            type: 'payment.processing',
            vendor_name: payment.vendor_name,
            amount: payment.amount,
            payment_method: payment.payment_method,
            status: 'processing',
            failure_reason: null,
            timestamp: payment.processed_date,
        } );
    }

    if ( payment.status === 'settled' && payment.settled_date ) {
        events.push( {
            id: `evt-${pad( evtCounter++, 4 )}`,
            payment_id: payment.id,
            type: 'payment.settled',
            vendor_name: payment.vendor_name,
            amount: payment.amount,
            payment_method: payment.payment_method,
            status: 'settled',
            failure_reason: null,
            timestamp: payment.settled_date,
        } );
    }

    if ( payment.status === 'failed' && payment.processed_date ) {
        events.push( {
            id: `evt-${pad( evtCounter++, 4 )}`,
            payment_id: payment.id,
            type: 'payment.failed',
            vendor_name: payment.vendor_name,
            amount: payment.amount,
            payment_method: payment.payment_method,
            status: 'failed',
            failure_reason: payment.failure_reason,
            timestamp: isoDate( addHours( new Date( payment.processed_date ), 1 ) ),
        } );
    }
}

// Generate reconciliation records — for settled + failed payments
const reconciliation: ReconciliationRecord[] = [];
let recCounter = 1;
let batchCounter = 1;

// Group settled payments by settled_date (roughly by day)
const settledPayments = payments.filter( ( p ) => p.status === 'settled' || p.status === 'failed' );
const batchGroups: Record<string, Payment[]> = {};

for ( const p of settledPayments ) {
    const dateKey = ( p.settled_date || p.processed_date || p.scheduled_date ).slice( 0, 10 );
    if ( !batchGroups[dateKey] ) batchGroups[dateKey] = [];
    batchGroups[dateKey].push( p );
}

for ( const [dateKey, batchPayments] of Object.entries( batchGroups ) ) {
    const batchId = `BATCH-${dateKey.replace( /-/g, '' )}-${String.fromCharCode( 64 + batchCounter )}`;
    batchCounter++;

    for ( const p of batchPayments ) {
        const invoice = invoices.find( ( i ) => i.id === p.invoice_id )!;
        // ~15% chance of a small mismatch for realism
        const hasMismatch = Math.random() < 0.15;
        const paymentAmount = hasMismatch
            ? p.amount - randomBetween( 10, 250 )
            : p.amount;
        const diff = Math.round( ( invoice.amount - paymentAmount ) * 100 ) / 100;

        reconciliation.push( {
            id: `rec-${pad( recCounter++, 3 )}`,
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            payment_id: p.id,
            vendor_name: p.vendor_name,
            invoice_amount: invoice.amount,
            payment_amount: paymentAmount,
            difference: Math.abs( diff ),
            matched: diff === 0 && p.status !== 'failed' ? 1 : 0,
            batch_id: batchId,
            settled_date: p.settled_date || p.processed_date || p.scheduled_date,
        } );
    }
}

// ─── Generate fraud alerts ─────────────────────────────────────────

const fraudRuleNames = [
    'High Amount',
    'New Vendor + High Amount',
    'Rapid Payments',
    'International Vendor',
    'Round Amount',
    'Failed Then Retry',
];

const fraudStatuses = ['pending', 'pending', 'pending', 'investigating', 'investigating', 'cleared', 'confirmed'];

const fraudAlerts: FraudAlertRow[] = [];
let fraudCounter = 1;

// Pick a subset of payments to flag
const shuffledPayments = [...payments].sort( () => Math.random() - 0.5 );
const flaggedCount = Math.min( Math.floor( payments.length * 0.4 ), 55 );

for ( let i = 0; i < flaggedCount; i++ ) {
    const payment = shuffledPayments[i];
    const vendor = vendors.find( ( v ) => v.id === payment.vendor_id )!;

    // Determine triggered rules based on payment characteristics
    const triggered: string[] = [];
    if ( payment.amount > 10000 ) triggered.push( 'High Amount' );
    if ( payment.amount > 5000 ) {
        const vendorAge = new Date( payment.created_at ).getTime() - new Date( vendor.created_at ).getTime();
        if ( vendorAge < 30 * 24 * 60 * 60 * 1000 ) triggered.push( 'New Vendor + High Amount' );
    }
    if ( payment.amount >= 1000 && payment.amount % 1000 === 0 ) triggered.push( 'Round Amount' );
    if ( payment.status === 'failed' ) triggered.push( 'Failed Then Retry' );

    // If no rules triggered naturally, assign 1-2 random rules
    if ( triggered.length === 0 ) {
        const count = Math.random() > 0.5 ? 2 : 1;
        const available = [...fraudRuleNames].sort( () => Math.random() - 0.5 );
        for ( let k = 0; k < count; k++ ) triggered.push( available[k] );
    }

    // Compute risk score with some randomness
    const baseScore = triggered.length * 20 + Math.floor( Math.random() * 25 );
    const riskScore = Math.min( 100, Math.max( 10, baseScore ) );
    const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

    // Spread flagged dates over the last 90 days
    const daysAgo = Math.floor( Math.random() * 90 );
    const flaggedAt = addDays( new Date( '2026-03-08' ), -daysAgo );

    fraudAlerts.push( {
        id: `fa-${pad( fraudCounter++, 3 )}`,
        payment_id: payment.id,
        vendor_id: vendor.id,
        vendor_name: vendor.name,
        amount: payment.amount,
        risk_score: riskScore,
        risk_level: riskLevel,
        triggered_rules: JSON.stringify( triggered ),
        status: randomPick( fraudStatuses ),
        flagged_at: isoDate( flaggedAt ),
    } );
}

// ─── Insert into SQLite ────────────────────────────────────────────

console.log( '🗄️  Opening database…' );
const db = new Database( DB_PATH );
db.pragma( 'journal_mode = WAL' );
db.pragma( 'foreign_keys = OFF' ); // disable during bulk insert

// Drop existing tables for clean re-seed
db.exec( `
  DROP TABLE IF EXISTS fraud_alerts;
  DROP TABLE IF EXISTS reconciliation_records;
  DROP TABLE IF EXISTS transaction_events;
  DROP TABLE IF EXISTS payments;
  DROP TABLE IF EXISTS invoices;
  DROP TABLE IF EXISTS vendors;
`);

// Re-create tables
db.exec( `
  CREATE TABLE vendors (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
    phone TEXT NOT NULL, address TEXT NOT NULL,
    payment_method TEXT NOT NULL, bank_name TEXT, account_last4 TEXT NOT NULL,
    routing_number TEXT, bank_verification_status TEXT NOT NULL,
    created_at TEXT NOT NULL, total_paid REAL NOT NULL DEFAULT 0
  );
  CREATE TABLE invoices (
    id TEXT PRIMARY KEY, vendor_id TEXT NOT NULL, vendor_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL, amount REAL NOT NULL, due_date TEXT NOT NULL,
    status TEXT NOT NULL, description TEXT NOT NULL, file_name TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE payments (
    id TEXT PRIMARY KEY, vendor_id TEXT NOT NULL, vendor_name TEXT NOT NULL,
    invoice_id TEXT NOT NULL, invoice_number TEXT NOT NULL,
    amount REAL NOT NULL, payment_method TEXT NOT NULL, status TEXT NOT NULL,
    scheduled_date TEXT NOT NULL, processed_date TEXT, settled_date TEXT,
    failure_reason TEXT, created_at TEXT NOT NULL
  );
  CREATE TABLE transaction_events (
    id TEXT PRIMARY KEY, payment_id TEXT NOT NULL, type TEXT NOT NULL,
    vendor_name TEXT NOT NULL, amount REAL NOT NULL, payment_method TEXT NOT NULL,
    status TEXT NOT NULL, failure_reason TEXT, timestamp TEXT NOT NULL
  );
  CREATE TABLE reconciliation_records (
    id TEXT PRIMARY KEY, invoice_id TEXT NOT NULL, invoice_number TEXT NOT NULL,
    payment_id TEXT NOT NULL, vendor_name TEXT NOT NULL,
    invoice_amount REAL NOT NULL, payment_amount REAL NOT NULL,
    difference REAL NOT NULL, matched INTEGER NOT NULL DEFAULT 1,
    batch_id TEXT NOT NULL, settled_date TEXT NOT NULL
  );
  CREATE TABLE fraud_alerts (
    id TEXT PRIMARY KEY, payment_id TEXT NOT NULL, vendor_id TEXT NOT NULL,
    vendor_name TEXT NOT NULL, amount REAL NOT NULL, risk_score INTEGER NOT NULL,
    risk_level TEXT NOT NULL, triggered_rules TEXT NOT NULL,
    status TEXT NOT NULL, flagged_at TEXT NOT NULL
  );
`);

// Insert data
const insertVendor = db.prepare( `INSERT INTO vendors VALUES (?,?,?,?,?,?,?,?,?,?,?,?)` );
const insertInvoice = db.prepare( `INSERT INTO invoices VALUES (?,?,?,?,?,?,?,?,?,?)` );
const insertPayment = db.prepare( `INSERT INTO payments VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)` );
const insertEvent = db.prepare( `INSERT INTO transaction_events VALUES (?,?,?,?,?,?,?,?,?)` );
const insertRec = db.prepare( `INSERT INTO reconciliation_records VALUES (?,?,?,?,?,?,?,?,?,?,?)` );
const insertFraud = db.prepare( `INSERT INTO fraud_alerts VALUES (?,?,?,?,?,?,?,?,?,?)` );

const insertAll = db.transaction( () => {
    for ( const v of vendors ) {
        insertVendor.run( v.id, v.name, v.email, v.phone, v.address, v.payment_method, v.bank_name, v.account_last4, v.routing_number, v.bank_verification_status, v.created_at, v.total_paid );
    }
    for ( const i of invoices ) {
        insertInvoice.run( i.id, i.vendor_id, i.vendor_name, i.invoice_number, i.amount, i.due_date, i.status, i.description, i.file_name, i.created_at );
    }
    for ( const p of payments ) {
        insertPayment.run( p.id, p.vendor_id, p.vendor_name, p.invoice_id, p.invoice_number, p.amount, p.payment_method, p.status, p.scheduled_date, p.processed_date, p.settled_date, p.failure_reason, p.created_at );
    }
    for ( const e of events ) {
        insertEvent.run( e.id, e.payment_id, e.type, e.vendor_name, e.amount, e.payment_method, e.status, e.failure_reason, e.timestamp );
    }
    for ( const r of reconciliation ) {
        insertRec.run( r.id, r.invoice_id, r.invoice_number, r.payment_id, r.vendor_name, r.invoice_amount, r.payment_amount, r.difference, r.matched, r.batch_id, r.settled_date );
    }
    for ( const f of fraudAlerts ) {
        insertFraud.run( f.id, f.payment_id, f.vendor_id, f.vendor_name, f.amount, f.risk_score, f.risk_level, f.triggered_rules, f.status, f.flagged_at );
    }
} );

insertAll();
db.close();

console.log( `✅ Seeded successfully!` );
console.log( `   ${vendors.length} vendors` );
console.log( `   ${invoices.length} invoices` );
console.log( `   ${payments.length} payments` );
console.log( `   ${events.length} transaction events` );
console.log( `   ${reconciliation.length} reconciliation records` );
console.log( `   ${fraudAlerts.length} fraud alerts` );
