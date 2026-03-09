import { NextResponse } from 'next/server';
import { getDb, mapReconciliation } from '@/lib/db';

export async function GET() {
    const db = getDb();
    const rows = db.prepare( 'SELECT * FROM reconciliation_records ORDER BY settled_date DESC' ).all();
    return NextResponse.json( rows.map( ( r ) => mapReconciliation( r as Record<string, unknown> ) ) );
}
