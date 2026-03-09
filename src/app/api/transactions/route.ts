import { NextResponse } from 'next/server';
import { getDb, mapTransactionEvent } from '@/lib/db';

export async function GET() {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'transaction_events' )
        .select( '*' )
        .order( 'timestamp', { ascending: false } );
    if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
    return NextResponse.json( ( data ?? [] ).map( ( r ) => mapTransactionEvent( r as Record<string, unknown> ) ) );
}

export const dynamic = 'force-dynamic';

