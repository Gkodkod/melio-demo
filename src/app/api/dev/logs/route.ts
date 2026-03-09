import { NextResponse } from 'next/server';
import { getDb, mapDevApiLog } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const rows = db.prepare( `
            SELECT * FROM dev_api_logs
            ORDER BY created_at DESC
            LIMIT 100
        ` ).all() as Record<string, unknown>[];
        const logs = rows.map( mapDevApiLog );

        return NextResponse.json( logs );
    } catch ( error ) {
        console.error( 'Error fetching API logs:', error );
        return NextResponse.json( { error: 'Failed to fetch API logs' }, { status: 500 } );
    }
}
