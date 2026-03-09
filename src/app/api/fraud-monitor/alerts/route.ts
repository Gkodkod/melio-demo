import { NextResponse } from 'next/server';
import { getDb, mapFraudAlert } from '@/lib/db';

export async function GET() {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'fraud_alerts' )
        .select( '*' )
        .order( 'risk_score', { ascending: false } );
    if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
    return NextResponse.json( ( data ?? [] ).map( ( r ) => mapFraudAlert( r as Record<string, unknown> ) ) );
}

export const dynamic = 'force-dynamic';

