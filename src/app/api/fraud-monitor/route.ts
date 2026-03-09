import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const db = getDb();

    const totalFlagged = ( db.prepare( 'SELECT COUNT(*) as c FROM fraud_alerts' ).get() as { c: number } ).c;
    const highRiskCount = ( db.prepare( "SELECT COUNT(*) as c FROM fraud_alerts WHERE risk_level = 'high'" ).get() as { c: number } ).c;
    const pendingReview = ( db.prepare( "SELECT COUNT(*) as c FROM fraud_alerts WHERE status = 'pending'" ).get() as { c: number } ).c;

    const today = new Date().toISOString().slice( 0, 10 );
    const clearedToday = ( db.prepare(
        "SELECT COUNT(*) as c FROM fraud_alerts WHERE status = 'cleared' AND flagged_at >= ?"
    ).get( today ) as { c: number } ).c;

    // Risk trend — last 30 days grouped by date
    const riskTrend = db.prepare( `
        SELECT
            DATE(flagged_at) as date,
            COUNT(*) as count,
            ROUND(AVG(risk_score), 1) as avgScore
        FROM fraud_alerts
        WHERE flagged_at >= DATE('now', '-30 days')
        GROUP BY DATE(flagged_at)
        ORDER BY date ASC
    ` ).all() as { date: string; count: number; avgScore: number }[];

    // Rule trigger statistics
    const allRules = db.prepare( 'SELECT triggered_rules FROM fraud_alerts' ).all() as { triggered_rules: string }[];
    const ruleCounts: Record<string, number> = {};
    for ( const row of allRules ) {
        const rules: string[] = JSON.parse( row.triggered_rules );
        for ( const rule of rules ) {
            ruleCounts[rule] = ( ruleCounts[rule] || 0 ) + 1;
        }
    }
    const ruleStats = Object.entries( ruleCounts )
        .map( ( [rule, triggerCount] ) => ( { rule, triggerCount } ) )
        .sort( ( a, b ) => b.triggerCount - a.triggerCount );

    return NextResponse.json( {
        totalFlagged,
        highRiskCount,
        pendingReview,
        clearedToday,
        riskTrend,
        ruleStats,
    } );
}
