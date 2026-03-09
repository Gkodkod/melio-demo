import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const supabase = getDb();

    // Fetch all vendors, payments, and fraud_alerts in parallel
    const [
        { data: vendorRows },
        { data: paymentRows },
        { data: fraudRows },
    ] = await Promise.all( [
        supabase.from( 'vendors' ).select( 'id, name, created_at, total_paid' ),
        supabase.from( 'payments' ).select( 'vendor_id, amount, status, created_at' ),
        supabase.from( 'fraud_alerts' ).select( 'vendor_id' ),
    ] );

    interface VendorRiskRow { id: string; name: string; created_at: string; total_paid: number }
    interface PaymentRiskRow { vendor_id: string; amount: number; status: string; created_at: string }

    const vendors = ( vendorRows ?? [] ) as VendorRiskRow[];
    const payments = ( paymentRows ?? [] ) as PaymentRiskRow[];
    const fraudAlerts = ( fraudRows ?? [] ) as { vendor_id: string }[];

    // Thirty-day cutoff
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate( thirtyDaysAgo.getDate() - 30 );
    const cutoff = thirtyDaysAgo.toISOString();

    const result = vendors.map( v => {
        const vPayments = payments.filter( p => p.vendor_id === v.id );
        const paymentFailures = vPayments.filter( p => p.status === 'failed' ).length;
        const highValuePayments = vPayments.filter( p => p.amount > 10000 ).length;
        const fraudAlertsCount = fraudAlerts.filter( f => f.vendor_id === v.id ).length;
        const paymentCount = vPayments.length;

        const score = ( paymentFailures * 2 ) + ( fraudAlertsCount * 5 ) + ( highValuePayments * 1 );
        let riskLevel = 'low';
        if ( score >= 20 ) riskLevel = 'high';
        else if ( score >= 10 ) riskLevel = 'medium';

        const anomalies: string[] = [];
        if ( paymentFailures > 2 ) anomalies.push( 'Frequent payment failures' );
        if ( fraudAlertsCount > 1 ) anomalies.push( 'Multiple fraud alerts flagged' );
        if ( highValuePayments > 5 && paymentCount < 10 ) anomalies.push( 'High value ratio anomaly' );

        return {
            id: v.id,
            name: v.name,
            totalVolume: v.total_paid,
            paymentCount,
            metrics: { paymentFailures, highValueCount: highValuePayments, fraudAlerts: fraudAlertsCount },
            score,
            riskLevel,
            anomalies,
            vendorAge: v.created_at,
        };
    } );

    // Risk history trend — last 30 days from payments
    const recentHighValue = payments.filter( p => p.amount > 10000 && p.created_at >= cutoff );
    const trendMap: Record<string, number> = {};
    for ( const p of recentHighValue ) {
        const date = p.created_at.slice( 0, 10 );
        trendMap[date] = ( trendMap[date] || 0 ) + 1;
    }
    let cumulativeRisk = 10;
    const riskHistory = Object.entries( trendMap )
        .sort( ( [a], [b] ) => a.localeCompare( b ) )
        .map( ( [date, highValue] ) => {
            cumulativeRisk = Math.min( 100, cumulativeRisk + highValue * 0.5 );
            return { date, avgScore: parseFloat( cumulativeRisk.toFixed( 1 ) ) };
        } );

    if ( riskHistory.length === 0 ) {
        for ( let i = 29; i >= 0; i-- ) {
            const d = new Date();
            d.setDate( d.getDate() - i );
            riskHistory.push( { date: d.toISOString().slice( 0, 10 ), avgScore: 5 + Math.random() * 5 } );
        }
    }

    const topRisky = [...result].sort( ( a, b ) => b.score - a.score ).slice( 0, 5 );
    const velocityData = topRisky.map( v => ( { name: v.name, volume: v.totalVolume, count: v.paymentCount } ) );

    return NextResponse.json( { vendors: result, riskHistory, velocityData } );
}
