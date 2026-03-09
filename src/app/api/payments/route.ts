export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb, mapPayment } from '@/lib/db';

export async function GET() {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'payments' )
        .select( '*' )
        .order( 'created_at', { ascending: false } );
    if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
    return NextResponse.json( ( data ?? [] ).map( ( r ) => mapPayment( r as Record<string, unknown> ) ) );
}
