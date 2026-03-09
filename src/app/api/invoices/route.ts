import { NextResponse } from 'next/server';
import { getDb, mapInvoice } from '@/lib/db';

export async function GET() {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'invoices' )
        .select( '*' )
        .order( 'created_at', { ascending: false } );
    if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
    return NextResponse.json( ( data ?? [] ).map( ( r ) => mapInvoice( r as Record<string, unknown> ) ) );
}
