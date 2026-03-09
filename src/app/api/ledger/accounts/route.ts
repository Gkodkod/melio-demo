export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb, mapLedgerAccount } from '@/lib/db';

export async function GET() {
    try {
        const supabase = getDb();
        const { data, error } = await supabase
            .from( 'ledger_accounts' )
            .select( '*' )
            .order( 'name', { ascending: true } );
        if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
        const accounts = ( data ?? [] ).map( row => mapLedgerAccount( row as Record<string, unknown> ) );
        return NextResponse.json( { accounts } );
    } catch ( error ) {
        console.error( 'Error fetching ledger accounts:', error );
        return NextResponse.json( { error: 'Internal server error' }, { status: 500 } );
    }
}
