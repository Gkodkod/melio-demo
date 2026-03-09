import { NextResponse } from 'next/server';
import { getDb, mapDevApiLog } from '@/lib/db';

export async function GET() {
    try {
        const supabase = getDb();
        const { data: rows, error } = await supabase
            .from( 'dev_api_logs' )
            .select( '*' )
            .order( 'created_at', { ascending: false } )
            .limit( 100 );
        if ( error ) throw error;
        const logs = ( rows ?? [] ).map( r => mapDevApiLog( r as Record<string, unknown> ) );
        return NextResponse.json( logs );
    } catch ( error ) {
        console.error( 'Error fetching API logs:', error );
        return NextResponse.json( { error: 'Failed to fetch API logs' }, { status: 500 } );
    }
}
