export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb, mapReconciliation } from '@/lib/db';

export async function GET() {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'reconciliation_records' )
        .select( '*' )
        .order( 'settled_date', { ascending: false } );
    if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
    return NextResponse.json( ( data ?? [] ).map( ( r ) => mapReconciliation( r as Record<string, unknown> ) ) );
}
