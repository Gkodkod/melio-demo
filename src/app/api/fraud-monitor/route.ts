import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const supabase = getDb();

    const [
        { count: totalFlagged },
        { count: highRiskCount },
        { count: pendingReview },
        { data: fraudData },
    ] = await Promise.all( [
        supabase.from( 'fraud_alerts' ).select( '*', { count: 'exact', head: true } ),
        supabase.from( 'fraud_alerts' ).select( '*', { count: 'exact', head: true } ).eq( 'risk_level', 'high' ),
        supabase.from( 'fraud_alerts' ).select( '*', { count: 'exact', head: true } ).eq( 'status', 'pending' ),
        supabase.from( 'fraud_alerts' ).select( 'flagged_at, risk_score, triggered_rules, status' ),
    ] );

    const today = new Date().toISOString().slice( 0, 10 );
    const clearedToday = ( fraudData ?? [] ).filter(
        ( r: { status: string; flagged_at: string } ) => r.status === 'cleared' && r.flagged_at >= today
    ).length;

    // Risk trend — last 30 days grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate( thirtyDaysAgo.getDate() - 30 );
    const cutoff = thirtyDaysAgo.toISOString();

    const recent = ( fraudData ?? [] ).filter( ( r: { flagged_at: string } ) => r.flagged_at >= cutoff );
    const trendMap: Record<string, { count: number; scores: number[] }> = {};
    for ( const r of recent as { flagged_at: string; risk_score: number }[] ) {
        const date = r.flagged_at.slice( 0, 10 );
        if ( !trendMap[date] ) trendMap[date] = { count: 0, scores: [] };
        trendMap[date].count++;
        trendMap[date].scores.push( r.risk_score );
    }
    const riskTrend = Object.entries( trendMap )
        .sort( ( [a], [b] ) => a.localeCompare( b ) )
        .map( ( [date, { count, scores }] ) => ( {
            date,
            count,
            avgScore: parseFloat( ( scores.reduce( ( s, v ) => s + v, 0 ) / scores.length ).toFixed( 1 ) ),
        } ) );

    // Rule trigger statistics
    const ruleCounts: Record<string, number> = {};
    for ( const row of ( fraudData ?? [] ) as { triggered_rules: string | string[] }[] ) {
        const rules: string[] = typeof row.triggered_rules === 'string'
            ? JSON.parse( row.triggered_rules )
            : row.triggered_rules;
        for ( const rule of rules ) {
            ruleCounts[rule] = ( ruleCounts[rule] || 0 ) + 1;
        }
    }
    const ruleStats = Object.entries( ruleCounts )
        .map( ( [rule, triggerCount] ) => ( { rule, triggerCount } ) )
        .sort( ( a, b ) => b.triggerCount - a.triggerCount );

    return NextResponse.json( {
        totalFlagged: totalFlagged ?? 0,
        highRiskCount: highRiskCount ?? 0,
        pendingReview: pendingReview ?? 0,
        clearedToday,
        riskTrend,
        ruleStats,
    } );
}
