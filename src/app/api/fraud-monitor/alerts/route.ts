import { NextResponse } from 'next/server';
import { getDb, mapFraudAlert } from '@/lib/db';

export async function GET() {
    const db = getDb();
    const rows = db.prepare( 'SELECT * FROM fraud_alerts ORDER BY risk_score DESC' ).all();
    return NextResponse.json( rows.map( ( r ) => mapFraudAlert( r as Record<string, unknown> ) ) );
}
