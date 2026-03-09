import { NextResponse } from 'next/server';
import { getDb, mapVendor } from '@/lib/db';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const db = getDb();
    const row = db.prepare( 'SELECT * FROM vendors WHERE id = ?' ).get( params.id );
    if ( !row ) {
        return NextResponse.json( { error: 'Vendor not found' }, { status: 404 } );
    }
    return NextResponse.json( mapVendor( row as Record<string, unknown> ) );
}
