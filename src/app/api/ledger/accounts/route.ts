import { NextResponse } from 'next/server';
import { getDb, mapLedgerAccount } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const rows = db.prepare( 'SELECT * FROM ledger_accounts ORDER BY name ASC' ).all();
        const accounts = rows.map( row => mapLedgerAccount( row as Record<string, unknown> ) );

        return NextResponse.json( { accounts } );
    } catch ( error ) {
        console.error( 'Error fetching ledger accounts:', error );
        return NextResponse.json( { error: 'Internal server error' }, { status: 500 } );
    }
}
