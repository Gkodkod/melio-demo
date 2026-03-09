import { NextResponse } from 'next/server';
import { getDb, mapTransactionEvent } from '@/lib/db';

export async function GET() {
    const db = getDb();
    const rows = db.prepare( 'SELECT * FROM transaction_events ORDER BY timestamp DESC' ).all();
    return NextResponse.json( rows.map( ( r ) => mapTransactionEvent( r as Record<string, unknown> ) ) );
}
