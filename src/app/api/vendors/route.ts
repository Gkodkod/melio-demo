import { NextResponse } from 'next/server';
import { getDb, mapVendor } from '@/lib/db';

export async function GET() {
    const db = getDb();
    const rows = db.prepare( 'SELECT * FROM vendors ORDER BY name' ).all();
    return NextResponse.json( rows.map( ( r ) => mapVendor( r as Record<string, unknown> ) ) );
}
