/**
 * Seed script for Supabase — generates a realistic dataset and uploads it.
 *
 * Setup:
 *   1. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local
 *   2. Run: npx tsx scripts/seed-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config( { path: path.join( process.cwd(), '.env.local' ) } );

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
);

// ─── Helpers ───────────────────────────────────────────────────────

function randomPick<T>( arr: T[] ): T { return arr[Math.floor( Math.random() * arr.length )]; }
function randomBetween( min: number, max: number ) { return Math.round( ( Math.random() * ( max - min ) + min ) * 100 ) / 100; }
function pad( n: number, len = 4 ) { return String( n ).padStart( len, '0' ); }
function isoDate( d: Date ) { return d.toISOString(); }
function addDays( d: Date, days: number ) { const r = new Date( d ); r.setDate( r.getDate() + days ); return r; }
function addHours( d: Date, hours: number ) { const r = new Date( d ); r.setHours( r.getHours() + hours ); return r; }

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
];
const bankNames = [
    'Chase Business', 'Silicon Valley Bank', 'Wells Fargo', 'Bank of America',
    'Frost Bank', 'KeyBank', 'US Bank', 'PNC Business', 'TD Bank',
];
const invoiceDescriptions = [
    'Q1 office supplies bulk order', 'Monthly cloud infrastructure hosting',
    'Freight shipping — pallets to warehouse', 'Team lunch catering sessions',
    'Legal advisory & contract review', 'Brand refresh — logo & style guide',
    'Annual SOC 2 compliance audit', 'Digital marketing campaign',
    'Ergonomic furniture order', 'GPU compute add-on hosting',
];
const failureReasons = [
    'Bank verification failed — card declined',
    'Insufficient funds in linked account',
    'ACH return — account not found (R03)',
    'Payment reversed by receiving bank',
    'Vendor bank account closed',
];
const fraudRuleNames = ['High Amount', 'New Vendor + High Amount', 'Rapid Payments', 'Round Amount', 'Failed Then Retry'];
const fraudStatuses = ['pending', 'pending', 'investigating', 'cleared', 'confirmed'];

// ─── Generate data ─────────────────────────────────────────────────

// Scale up vendors
const extraVendors = Array.from( { length: 20 }, ( _, i ) => ({
    name: `Vendor ${i + 31} Corp`,
    domain: `vendor${i + 31}.com`
}));

const vendors = [
    ...companyNames.map( ( name, i ) => ({ name, domain: emailDomains[i] })),
    ...extraVendors
].map( ( v, i ) => {
    const method = Math.random() > 0.3 ? 'ach' : 'card';
    const verified = Math.random();
    return {
        id: `v-${pad( i + 1, 3 )}`,
        name: v.name, email: `billing@${v.domain}`,
        phone: `(${randomBetween( 200, 999 ).toFixed( 0 )}) 555-${pad( Math.floor( Math.random() * 10000 ), 4 )}`,
        address: `${Math.floor( Math.random() * 2000 ) + 100} Main St, ${randomPick( cities )}`,
        payment_method: method,
        bank_name: method === 'ach' ? randomPick( bankNames ) : null,
        account_last4: pad( Math.floor( Math.random() * 10000 ), 4 ),
        routing_number: method === 'ach' ? `0${pad( Math.floor( Math.random() * 100000000 ), 8 )}` : null,
        bank_verification_status: verified > 0.2 ? 'verified' : verified > 0.1 ? 'pending' : 'failed',
        created_at: isoDate( addDays( new Date( '2025-01-01' ), Math.floor( Math.random() * 400 ) ) ),
        total_paid: 0,
    };
} );

const invoices: Record<string, unknown>[] = [];
let invCounter = 1;
const invoicePrefixes = ['INV', 'CH', 'DL', 'FOC', 'GL', 'PCD', 'SIS', 'TN', 'APX', 'BW'];
for ( const vendor of vendors ) {
    // Generate 10-20 invoices per vendor for more data
    const count = Math.floor( Math.random() * 10 ) + 10;
    for ( let j = 0; j < count; j++ ) {
        const prefix = randomPick( invoicePrefixes );
        const amount = randomBetween( 500, 35000 );
        // More recent invoices to ensure they fall within the last 30-90 days
        const createdDate = addDays( new Date(), -Math.floor( Math.random() * 120 ) );
        const status = randomPick( ['pending', 'approved', 'approved', 'approved', 'paid', 'rejected'] );
        invoices.push( {
            id: `inv-${pad( invCounter, 3 )}`,
            vendor_id: vendor.id, vendor_name: vendor.name,
            invoice_number: `${prefix}-2026-${pad( invCounter )}`,
            amount, due_date: isoDate( addDays( createdDate, Math.floor( Math.random() * 30 ) + 14 ) ),
            status, description: randomPick( invoiceDescriptions ),
            file_name: Math.random() > 0.3 ? `invoice_${invCounter}.pdf` : null,
            created_at: isoDate( createdDate ),
        } );
        invCounter++;
    }
}

const payments: Record<string, unknown>[] = [];
let payCounter = 1;
const paymentStatuses = ['draft', 'scheduled', 'processing', 'settled', 'settled', 'settled', 'failed'];
for ( const invoice of invoices ) {
    if ( invoice.status !== 'approved' && invoice.status !== 'paid' ) continue;
    const vendor = vendors.find( v => v.id === invoice.vendor_id )!;
    const status = randomPick( paymentStatuses );
    const createdDate = new Date( invoice.created_at as string );
    const scheduledDate = addDays( createdDate, Math.floor( Math.random() * 10 ) + 1 );
    const processedDate = ['processing', 'settled', 'failed'].includes( status )
        ? addHours( scheduledDate, Math.floor( Math.random() * 8 ) + 1 ) : null;
    const settledDate = status === 'settled' && processedDate
        ? addHours( processedDate, Math.floor( Math.random() * 12 ) + 4 ) : null;
    payments.push( {
        id: `pay-${pad( payCounter, 3 )}`,
        vendor_id: vendor.id, vendor_name: vendor.name,
        invoice_id: invoice.id, invoice_number: invoice.invoice_number,
        amount: invoice.amount, payment_method: vendor.payment_method, status,
        scheduled_date: isoDate( scheduledDate ),
        processed_date: processedDate ? isoDate( processedDate ) : null,
        settled_date: settledDate ? isoDate( settledDate ) : null,
        failure_reason: status === 'failed' ? randomPick( failureReasons ) : null,
        created_at: isoDate( addDays( createdDate, 1 ) ),
    } );
    payCounter++;
}

// Compute vendor total_paid
for ( const vendor of vendors ) {
    vendor.total_paid = ( payments as { vendor_id: string; status: string; amount: number }[] )
        .filter( p => p.vendor_id === vendor.id && p.status === 'settled' )
        .reduce( ( sum, p ) => sum + p.amount, 0 );
}

const events: Record<string, unknown>[] = [];
let evtCounter = 1;
for ( const payment of payments as { id: string; vendor_name: string; amount: number; payment_method: string; status: string; failure_reason: string | null; created_at: string; processed_date: string | null; settled_date: string | null }[] ) {
    events.push( { id: `evt-${pad( evtCounter++, 4 )}`, payment_id: payment.id, type: 'payment.created', vendor_name: payment.vendor_name, amount: payment.amount, payment_method: payment.payment_method, status: 'scheduled', failure_reason: null, timestamp: payment.created_at } );
    if ( ['processing', 'settled', 'failed'].includes( payment.status ) && payment.processed_date ) {
        events.push( { id: `evt-${pad( evtCounter++, 4 )}`, payment_id: payment.id, type: 'payment.processing', vendor_name: payment.vendor_name, amount: payment.amount, payment_method: payment.payment_method, status: 'processing', failure_reason: null, timestamp: payment.processed_date } );
    }
    if ( payment.status === 'settled' && payment.settled_date ) {
        events.push( { id: `evt-${pad( evtCounter++, 4 )}`, payment_id: payment.id, type: 'payment.settled', vendor_name: payment.vendor_name, amount: payment.amount, payment_method: payment.payment_method, status: 'settled', failure_reason: null, timestamp: payment.settled_date } );
    }
    if ( payment.status === 'failed' && payment.processed_date ) {
        events.push( { id: `evt-${pad( evtCounter++, 4 )}`, payment_id: payment.id, type: 'payment.failed', vendor_name: payment.vendor_name, amount: payment.amount, payment_method: payment.payment_method, status: 'failed', failure_reason: payment.failure_reason, timestamp: isoDate( addHours( new Date( payment.processed_date ), 1 ) ) } );
    }
}

const reconciliation: Record<string, unknown>[] = [];
let recCounter = 1, batchCounter = 1;
const settledPayments = ( payments as { id: string; status: string; invoice_id: string; vendor_name: string; amount: number; settled_date: string | null; processed_date: string | null; scheduled_date: string }[] ).filter( p => p.status === 'settled' || p.status === 'failed' );
const batchGroups: Record<string, typeof settledPayments> = {};
for ( const p of settledPayments ) {
    const key = ( p.settled_date || p.processed_date || p.scheduled_date ).slice( 0, 10 );
    if ( !batchGroups[key] ) batchGroups[key] = [];
    batchGroups[key].push( p );
}
for ( const [dateKey, batchPayments] of Object.entries( batchGroups ) ) {
    const batchId = `BATCH-${dateKey.replace( /-/g, '' )}-${String.fromCharCode( 64 + batchCounter )}`;
    batchCounter++;
    for ( const p of batchPayments ) {
        const invoice = invoices.find( i => i.id === p.invoice_id ) as { amount: number } | undefined;
        const hasMismatch = Math.random() < 0.15;
        const paymentAmount = hasMismatch ? p.amount - randomBetween( 10, 250 ) : p.amount;
        const diff = Math.round( ( ( invoice?.amount ?? p.amount ) - paymentAmount ) * 100 ) / 100;
        reconciliation.push( {
            id: `rec-${pad( recCounter++, 3 )}`, invoice_id: p.invoice_id,
            invoice_number: ( invoices.find( i => i.id === p.invoice_id ) as { invoice_number: string } | undefined )?.invoice_number ?? '',
            payment_id: p.id, vendor_name: p.vendor_name,
            invoice_amount: invoice?.amount ?? p.amount, payment_amount: paymentAmount,
            difference: Math.abs( diff ), matched: diff === 0 && p.status !== 'failed',
            batch_id: batchId, settled_date: p.settled_date || p.processed_date || p.scheduled_date,
        } );
    }
}

const fraudAlerts: Record<string, unknown>[] = [];
let fraudCounter = 1;
const shuffled = [...payments as { id: string; vendor_id: string; amount: number; status: string; created_at: string }[]].sort( () => Math.random() - 0.5 );

// Increase flagged count to 80% to show more data in charts
const flaggedCount = Math.floor( payments.length * 0.8 ); 

for ( let i = 0; i < flaggedCount; i++ ) {
    const payment = shuffled[i];
    const vendor = vendors.find( v => v.id === payment.vendor_id )!;
    const triggered: string[] = [];
    if ( payment.amount > 10000 ) triggered.push( 'High Amount' );
    if ( payment.amount > 5000 ) {
        const vendorAge = new Date( payment.created_at ).getTime() - new Date( vendor.created_at ).getTime();
        if ( vendorAge < 30 * 24 * 60 * 60 * 1000 ) triggered.push( 'New Vendor + High Amount' );
    }
    if ( payment.amount >= 1000 && payment.amount % 1000 === 0 ) triggered.push( 'Round Amount' );
    if ( payment.status === 'failed' ) triggered.push( 'Failed Then Retry' );
    if ( triggered.length === 0 ) {
        const count = Math.random() > 0.5 ? 2 : 1;
        const available = [...fraudRuleNames].sort( () => Math.random() - 0.5 );
        for ( let k = 0; k < count; k++ ) triggered.push( available[k] );
    }
    const baseScore = triggered.length * 20 + Math.floor( Math.random() * 25 );
    const riskScore = Math.min( 100, Math.max( 10, baseScore ) );
    const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low';
    
    // Concentrate 70% of alerts in the last 30 days for a dense chart
    const isRecent = Math.random() > 0.3;
    const daysBack = isRecent ? Math.floor( Math.random() * 30 ) : Math.floor( Math.random() * 90 );
    const flaggedAt = addDays( new Date(), -daysBack );
    
    fraudAlerts.push( {
        id: `fa-${pad( fraudCounter++, 3 )}`, payment_id: payment.id, vendor_id: vendor.id,
        vendor_name: vendor.name, amount: payment.amount, risk_score: riskScore, risk_level: riskLevel,
        triggered_rules: triggered, status: randomPick( fraudStatuses ), flagged_at: isoDate( flaggedAt ),
    } );
}

const partners = [
    { id: 'ptn-001', name: 'Capital One', status: 'active', integration_status: 'healthy', api_usage: 1450200, webhook_url: 'https://api.capitalone.com/webhooks/melio', created_at: '2024-01-15T08:00:00Z' },
    { id: 'ptn-002', name: 'Plaid', status: 'active', integration_status: 'healthy', api_usage: 3890000, webhook_url: 'https://hooks.plaid.com/melio/v1', created_at: '2024-03-22T10:30:00Z' },
    { id: 'ptn-003', name: 'Shopify', status: 'active', integration_status: 'degraded', api_usage: 8500400, webhook_url: 'https://api.shopify.com/v1/webhooks/melio-events', created_at: '2023-11-05T14:15:00Z' },
    { id: 'ptn-004', name: 'QuickBooks Online', status: 'inactive', integration_status: 'offline', api_usage: 125000, webhook_url: null, created_at: '2025-06-12T09:45:00Z' },
    { id: 'ptn-005', name: 'Xero', status: 'active', integration_status: 'healthy', api_usage: 920500, webhook_url: 'https://api.xero.com/webhooks/v1/melio', created_at: '2024-08-30T11:20:00Z' },
];
const apiKeys = [
    { id: 'key-001', partner_id: 'ptn-001', key_value: 'pk_live_cap1_8f92j3n4b5v6c7x8z9m0', status: 'active', created_at: '2024-01-15T08:05:00Z', last_used_at: '2026-03-08T22:45:00Z' },
    { id: 'key-002', partner_id: 'ptn-002', key_value: 'pk_live_plaid_1a2s3d4f5g6h7j8k9l0', status: 'active', created_at: '2024-03-22T10:35:00Z', last_used_at: '2026-03-08T22:50:00Z' },
    { id: 'key-003', partner_id: 'ptn-003', key_value: 'pk_live_stripe_q1w2e3r4t5y6u7i8o9p0', status: 'active', created_at: '2023-11-05T14:20:00Z', last_used_at: '2026-03-08T22:55:00Z' },
    { id: 'key-004', partner_id: 'ptn-003', key_value: 'pk_test_stripe_zxcvbnmasdfghjklqw', status: 'revoked', created_at: '2023-11-01T09:00:00Z', last_used_at: '2023-11-05T14:00:00Z' },
    { id: 'key-005', partner_id: 'ptn-005', key_value: 'pk_live_xero_m9n8b7v6c5x4z3a2s1d0', status: 'active', created_at: '2024-08-30T11:25:00Z', last_used_at: '2026-03-08T22:30:00Z' },
];
const webhookSubs = [
    { id: 'sub-001', partner_id: 'ptn-001', event_type: 'payment.created', created_at: '2024-01-15T08:10:00Z' },
    { id: 'sub-002', partner_id: 'ptn-001', event_type: 'payment.settled', created_at: '2024-01-15T08:10:00Z' },
    { id: 'sub-003', partner_id: 'ptn-002', event_type: 'payment.processing', created_at: '2024-03-22T10:40:00Z' },
    { id: 'sub-004', partner_id: 'ptn-002', event_type: 'payment.settled', created_at: '2024-03-22T10:40:00Z' },
    { id: 'sub-005', partner_id: 'ptn-003', event_type: 'payment.failed', created_at: '2023-11-05T14:25:00Z' },
];
const apiMetrics: Record<string, unknown>[] = [];
for ( let i = 29; i >= 0; i-- ) {
    const d = new Date(); d.setDate( d.getDate() - i );
    const dateStr = d.toISOString().split( 'T' )[0];
    apiMetrics.push( { id: `met-cap1-${i}`, partner_id: 'ptn-001', date: dateStr, requests: Math.floor( Math.random() * 50000 ) + 40000, errors: Math.floor( Math.random() * 100 ), latency_ms: Math.floor( Math.random() * 50 ) + 100 } );
    apiMetrics.push( { id: `met-plaid-${i}`, partner_id: 'ptn-002', date: dateStr, requests: Math.floor( Math.random() * 100000 ) + 90000, errors: Math.floor( Math.random() * 50 ), latency_ms: Math.floor( Math.random() * 30 ) + 80 } );
    apiMetrics.push( { id: `met-stripe-${i}`, partner_id: 'ptn-003', date: dateStr, requests: Math.floor( Math.random() * 200000 ) + 150000, errors: Math.floor( Math.random() * 500 ) + 100, latency_ms: Math.floor( Math.random() * 200 ) + 300 } );
    apiMetrics.push( { id: `met-qb-${i}`, partner_id: 'ptn-004', date: dateStr, requests: Math.floor( Math.random() * 5000 ) + 1000, errors: Math.floor( Math.random() * 5 ), latency_ms: Math.floor( Math.random() * 100 ) + 150 } );
    apiMetrics.push( { id: `met-xero-${i}`, partner_id: 'ptn-005', date: dateStr, requests: Math.floor( Math.random() * 30000 ) + 20000, errors: Math.floor( Math.random() * 20 ), latency_ms: Math.floor( Math.random() * 40 ) + 120 } );
}

// ─── Generate Ledger Entries ───────────────────────────────────────

const ledgerEntries: Record<string, unknown>[] = [];
let ledgerCounter = 1;

const accountBalances: Record<string, number> = {
    'acc_buyer': 0,
    'acc_vendor': 0,
    'acc_capital': 0,
    'acc_expense': 0,
};

// 1. Initial Capital Injection
const capitalAmount = 1000000;
const capitalDate = isoDate( new Date( '2025-01-01' ) );
ledgerEntries.push( {
    id: `ent-${pad( ledgerCounter++, 4 )}`,
    transaction_id: 'txn_capital_funding',
    account_id: 'acc_buyer',
    account_name: 'buyer_wallet',
    debit: capitalAmount,
    credit: null,
    description: 'Initial external capital funding',
    created_at: capitalDate,
} );
accountBalances['acc_buyer'] += capitalAmount;

ledgerEntries.push( {
    id: `ent-${pad( ledgerCounter++, 4 )}`,
    transaction_id: 'txn_capital_funding',
    account_id: 'acc_capital',
    account_name: 'external_capital',
    debit: null,
    credit: capitalAmount,
    description: 'Initial external capital funding',
    created_at: capitalDate,
} );
accountBalances['acc_capital'] += capitalAmount; // Equity increases with credit

// 2. Invoice Accruals
for ( const invoice of invoices as { id: string; amount: number; vendor_name: string; created_at: string; status: string }[] ) {
    if ( invoice.status === 'rejected' || invoice.status === 'pending' ) continue;

    const transactionId = `txn_inv_${invoice.id}`;

    // Debit Operating Expenses
    ledgerEntries.push( {
        id: `ent-${pad( ledgerCounter++, 4 )}`,
        transaction_id: transactionId,
        account_id: 'acc_expense',
        account_name: 'operating_expenses',
        debit: invoice.amount,
        credit: null,
        description: `Invoice accrued from ${invoice.vendor_name}`,
        created_at: invoice.created_at,
    } );
    accountBalances['acc_expense'] += invoice.amount; // Expense increases with debit

    // Credit Vendor Payable
    ledgerEntries.push( {
        id: `ent-${pad( ledgerCounter++, 4 )}`,
        transaction_id: transactionId,
        account_id: 'acc_vendor',
        account_name: 'vendor_payable',
        debit: null,
        credit: invoice.amount,
        description: `Invoice accrued from ${invoice.vendor_name}`,
        created_at: invoice.created_at,
    } );
    accountBalances['acc_vendor'] += invoice.amount; // Liability increases with credit
}

// 3. Payments
for ( const payment of payments as { id: string; amount: number; vendor_name: string; created_at: string; status: string }[] ) {
    if ( payment.status !== 'settled' && payment.status !== 'processing' ) continue;

    const transactionId = `txn_pay_${payment.id}`;

    // Debit Vendor Payable (relieve liability)
    ledgerEntries.push( {
        id: `ent-${pad( ledgerCounter++, 4 )}`,
        transaction_id: transactionId,
        account_id: 'acc_vendor',
        account_name: 'vendor_payable',
        debit: payment.amount,
        credit: null,
        description: `Payment to ${payment.vendor_name}`,
        created_at: payment.created_at,
    } );
    accountBalances['acc_vendor'] -= payment.amount;

    // Credit Buyer Wallet (reduce asset)
    ledgerEntries.push( {
        id: `ent-${pad( ledgerCounter++, 4 )}`,
        transaction_id: transactionId,
        account_id: 'acc_buyer',
        account_name: 'buyer_wallet',
        debit: null,
        credit: payment.amount,
        description: `Payment to ${payment.vendor_name}`,
        created_at: payment.created_at,
    } );
    accountBalances['acc_buyer'] -= payment.amount;
}

const ledgerAccounts = [
    { id: 'acc_buyer', name: 'buyer_wallet', type: 'asset', balance: accountBalances['acc_buyer'], created_at: capitalDate },
    { id: 'acc_vendor', name: 'vendor_payable', type: 'liability', balance: accountBalances['acc_vendor'], created_at: capitalDate },
    { id: 'acc_capital', name: 'external_capital', type: 'equity', balance: accountBalances['acc_capital'], created_at: capitalDate },
    { id: 'acc_expense', name: 'operating_expenses', type: 'expense', balance: accountBalances['acc_expense'], created_at: capitalDate }
];

// ─── Generate Dev API Logs ─────────────────────────────────────────

const devApiLogs: Record<string, unknown>[] = [];
let devLogCounter = 1;

for ( let i = 0; i < 15; i++ ) {
    const isError = Math.random() > 0.8;
    const method = Math.random() > 0.5 ? 'POST' : 'GET';
    const endpoint = method === 'POST' ? '/api/dev/payments' : '/api/dev/keys';

    devApiLogs.push( {
        id: `log-${pad( devLogCounter++, 4 )}`,
        endpoint,
        method,
        status_code: isError ? 400 : 200,
        latency_ms: Math.floor( Math.random() * 300 ) + 50,
        request_payload: method === 'POST' ? JSON.stringify( { amount: 5000, vendor_id: 'v-001' } ) : null,
        response_payload: isError ? JSON.stringify( { error: 'Invalid payload' } ) : JSON.stringify( { success: true, id: `pay-${pad( Math.floor( Math.random() * 100 ), 3 )}` } ),
        created_at: isoDate( addHours( new Date(), -Math.floor( Math.random() * 48 ) ) ),
    } );
}

// ─── Insert into Supabase ──────────────────────────────────────────

async function upsertBatch( table: string, rows: Record<string, unknown>[], batchSize = 200, onConflict = 'id' ) {
    for ( let i = 0; i < rows.length; i += batchSize ) {
        const batch = rows.slice( i, i + batchSize );
        const { error } = await supabase.from( table ).upsert( batch, { onConflict } );
        if ( error ) { console.error( `Error inserting into ${table}:`, error ); throw error; }
    }
}

async function main() {
    console.log( '🚀 Seeding Supabase...' );

    await upsertBatch( 'vendors', vendors as unknown as Record<string, unknown>[] );
    console.log( `✅ ${vendors.length} vendors` );

    await upsertBatch( 'invoices', invoices );
    console.log( `✅ ${invoices.length} invoices` );

    await upsertBatch( 'payments', payments );
    console.log( `✅ ${payments.length} payments` );

    await upsertBatch( 'transaction_events', events );
    console.log( `✅ ${events.length} transaction events` );

    await upsertBatch( 'reconciliation_records', reconciliation );
    console.log( `✅ ${reconciliation.length} reconciliation records` );

    await upsertBatch( 'fraud_alerts', fraudAlerts );
    console.log( `✅ ${fraudAlerts.length} fraud alerts` );

    await upsertBatch( 'partners', partners );
    await upsertBatch( 'partner_api_keys', apiKeys );
    await upsertBatch( 'partner_webhook_subscriptions', webhookSubs );
    console.log( `✅ ${partners.length} partners (+ keys, webhooks, metrics)` );

    // Clear ledger tables for clean start
    const { error: delEntErr } = await supabase.from( 'ledger_entries' ).delete().gte( 'created_at', '2000-01-01' );
    const { error: delAccErr } = await supabase.from( 'ledger_accounts' ).delete().gte( 'created_at', '2000-01-01' );

    if ( delEntErr ) console.error( 'Error clearing ledger entries:', delEntErr );
    if ( delAccErr ) console.error( 'Error clearing ledger accounts:', delAccErr );

    console.log( '🧹 Cleared old ledger data' );

    await upsertBatch( 'ledger_accounts', ledgerAccounts );
    console.log( `✅ ${ledgerAccounts.length} ledger accounts updated` );
    console.table( ledgerAccounts.map( a => ( { id: a.id, name: a.name, balance: a.balance } ) ) );

    await upsertBatch( 'ledger_entries', ledgerEntries );
    console.log( `✅ ${ledgerEntries.length} ledger entries` );

    await upsertBatch( 'dev_api_logs', devApiLogs );
    console.log( `✅ ${devApiLogs.length} dev API logs` );

    console.log( '\n🎉 Seeding complete!' );
}

main().catch( err => { console.error( err ); process.exit( 1 ); } );
