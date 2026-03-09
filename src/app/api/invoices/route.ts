import { NextResponse } from 'next/server';
import { getDb, mapInvoice } from '@/lib/db';

export async function GET() {
    const db = getDb();
    const rows = db.prepare( 'SELECT * FROM invoices ORDER BY created_at DESC' ).all();
    return NextResponse.json( rows.map( ( r ) => mapInvoice( r as Record<string, unknown> ) ) );
}
