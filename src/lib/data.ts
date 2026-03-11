import { getDb, mapVendor, mapInvoice, mapPayment, mapTransactionEvent, mapFraudAlert } from './db';
import { Vendor, Invoice, Payment, TransactionEvent, DashboardSummary, FraudAlert, FraudDashboardSummary } from './types';

export async function getVendors(): Promise<Vendor[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'vendors' )
        .select( '*' )
        .order( 'name', { ascending: true } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapVendor( r as Record<string, unknown> ) as Vendor );
}

export async function getVendorById( id: string ): Promise<Vendor | null> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'vendors' )
        .select( '*' )
        .eq( 'id', id )
        .single();
    
    if ( error ) return null;
    return mapVendor( data as Record<string, unknown> ) as Vendor;
}

export async function getInvoices(): Promise<Invoice[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'invoices' )
        .select( '*' )
        .order( 'created_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapInvoice( r as Record<string, unknown> ) as Invoice );
}

export async function getPayments(): Promise<Payment[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'payments' )
        .select( '*' )
        .order( 'created_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapPayment( r as Record<string, unknown> ) as Payment );
}

export async function getPaymentsByVendorId( vendorId: string ): Promise<Payment[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'payments' )
        .select( '*' )
        .eq( 'vendor_id', vendorId )
        .order( 'created_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapPayment( r as Record<string, unknown> ) as Payment );
}

export async function getInvoicesByVendorId( vendorId: string ): Promise<Invoice[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'invoices' )
        .select( '*' )
        .eq( 'vendor_id', vendorId )
        .order( 'created_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapInvoice( r as Record<string, unknown> ) as Invoice );
}

export async function getTransactionEvents(): Promise<TransactionEvent[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'transaction_events' )
        .select( '*' )
        .order( 'timestamp', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapTransactionEvent( r as Record<string, unknown> ) as TransactionEvent );
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
    const supabase = getDb();

    const [
        { count: total },
        { count: pending },
        { count: completed },
        { count: failed },
        { data: volumeAll },
        { data: volumePending },
    ] = await Promise.all( [
        supabase.from( 'payments' ).select( '*', { count: 'exact', head: true } ),
        supabase.from( 'payments' ).select( '*', { count: 'exact', head: true } ).in( 'status', ['scheduled', 'draft'] ),
        supabase.from( 'payments' ).select( '*', { count: 'exact', head: true } ).eq( 'status', 'settled' ),
        supabase.from( 'payments' ).select( '*', { count: 'exact', head: true } ).eq( 'status', 'failed' ),
        supabase.from( 'payments' ).select( 'amount' ),
        supabase.from( 'payments' ).select( 'amount' ).in( 'status', ['scheduled', 'draft', 'processing'] ),
    ] );

    const totalVolume = ( volumeAll ?? [] ).reduce( ( sum: number, r: { amount: number } ) => sum + ( r.amount ?? 0 ), 0 );
    const pendingVolume = ( volumePending ?? [] ).reduce( ( sum: number, r: { amount: number } ) => sum + ( r.amount ?? 0 ), 0 );

    return {
        totalPayments: total ?? 0,
        pendingPayments: pending ?? 0,
        completedPayments: completed ?? 0,
        failedPayments: failed ?? 0,
        totalVolume,
        pendingVolume,
    };
}

export async function getFraudAlerts(): Promise<FraudAlert[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'fraud_alerts' )
        .select( '*' )
        .order( 'flagged_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapFraudAlert( r as Record<string, unknown> ) as FraudAlert );
}

export async function getFraudSummary(): Promise<FraudDashboardSummary> {
    const supabase = getDb();
    
    const { data, error } = await supabase
        .from( 'fraud_alerts' )
        .select( '*' );
    
    if ( error ) throw new Error( error.message );
    
    const alerts = ( data ?? [] ).map( ( r ) => mapFraudAlert( r as Record<string, unknown> ) as FraudAlert );
    
    const totalFlagged = alerts.length;
    const highRiskCount = alerts.filter( a => a.riskLevel === 'high' ).length;
    const pendingReview = alerts.filter( a => a.status === 'pending' || a.status === 'investigating' ).length;
    
    const today = new Date().toISOString().slice( 0, 10 );
    const clearedToday = alerts.filter( a => a.status === 'cleared' && a.flaggedAt >= today ).length;

    // Risk trend — last 30 days grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate( thirtyDaysAgo.getDate() - 30 );
    const cutoff = thirtyDaysAgo.toISOString();

    const recent = alerts.filter( a => a.flaggedAt >= cutoff );
    const trendMap: Record<string, { count: number; scores: number[] }> = {};
    
    recent.forEach( a => {
        const date = a.flaggedAt.slice( 0, 10 );
        if ( !trendMap[date] ) trendMap[date] = { count: 0, scores: [] };
        trendMap[date].count++;
        trendMap[date].scores.push( a.riskScore );
    } );

    const riskTrend = Object.entries( trendMap )
        .sort( ( [a], [b] ) => a.localeCompare( b ) )
        .map( ( [date, { count, scores }] ) => ( {
            date,
            count,
            avgScore: parseFloat( ( scores.reduce( ( s, v ) => s + v, 0 ) / scores.length ).toFixed( 1 ) ),
        } ) );
    
    const ruleCounts: Record<string, number> = {};
    alerts.forEach( a => {
        a.triggeredRules.forEach( r => {
            ruleCounts[r] = ( ruleCounts[r] || 0 ) + 1;
        } );
    } );
    
    const ruleStats = Object.entries( ruleCounts )
        .map( ([rule, triggerCount]) => ({ rule, triggerCount }) )
        .sort( ( a, b ) => b.triggerCount - a.triggerCount );

    return {
        totalFlagged,
        highRiskCount,
        pendingReview,
        clearedToday,
        riskTrend,
        ruleStats,
    };
}
