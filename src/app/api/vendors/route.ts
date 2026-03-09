import { NextResponse } from 'next/server';
import { getDb, mapVendor } from '@/lib/db';

export async function GET() {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'vendors' )
        .select( '*' )
        .order( 'name', { ascending: true } );
    if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
    return NextResponse.json( ( data ?? [] ).map( ( r ) => mapVendor( r as Record<string, unknown> ) ) );
}

export const dynamic = 'force-dynamic';

