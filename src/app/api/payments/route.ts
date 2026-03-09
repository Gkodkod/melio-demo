import { NextResponse } from 'next/server';
import { getDb, mapPayment } from '@/lib/db';

export async function GET() {
    const db = getDb();
    const rows = db.prepare( 'SELECT * FROM payments ORDER BY created_at DESC' ).all();
    return NextResponse.json( rows.map( ( r ) => mapPayment( r as Record<string, unknown> ) ) );
}
