import { NextResponse } from 'next/server';
import { getDb, mapRetryQueueEntry } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const rows = db.prepare( 'SELECT * FROM retry_queue ORDER BY created_at DESC' ).all();
        return NextResponse.json( rows.map( row => mapRetryQueueEntry( row as Record<string, unknown> ) ) );
    } catch ( error ) {
        console.error( 'Failed to fetch retry queue:', error );
        return NextResponse.json( { error: 'Failed to fetch retry queue' }, { status: 500 } );
    }
}

export async function POST( request: Request ) {
    try {
        const { action } = await request.json();
        const db = getDb();

        if ( action === 'inject' ) {
            const queueId = `rq_${Date.now()}`;
            const paymentId = `pay_err_${Math.floor( Math.random() * 10000 )}`;
            const now = new Date().toISOString();

            const errorMessages = [
                'Connection reset by peer',
                'Timeout querying banking API',
                'Insufficient funds in ledger',
                'Rate limit exceeded for provider'
            ];
            const randomError = errorMessages[Math.floor( Math.random() * errorMessages.length )];

            db.prepare( `
        INSERT INTO retry_queue 
        (id, payment_id, error_message, retry_attempts, next_retry_at, backoff_policy, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
                queueId,
                paymentId,
                randomError,
                0,
                now, // Ready immediately
                'exponential',
                'pending',
                now,
                now
            );

            return NextResponse.json( { success: true, queueId } );
        }

        if ( action === 'tick' || action === 'process' ) {
            const pendingItems = db.prepare( `SELECT * FROM retry_queue WHERE status = 'pending'` ).all();
            let processed = 0;
            let resolved = 0;

            const stmtUpdateResolved = db.prepare( `UPDATE retry_queue SET status = 'resolved', updated_at = ? WHERE id = ?` );
            const stmtUpdateFailed = db.prepare( `UPDATE retry_queue SET status = 'failed', updated_at = ? WHERE id = ?` );
            const stmtUpdatePending = db.prepare( `UPDATE retry_queue SET retry_attempts = ?, next_retry_at = ?, updated_at = ? WHERE id = ?` );

            for ( const item of pendingItems as any[] ) {
                processed++;
                const currentAttempts = item.retry_attempts;
                const newAttempts = currentAttempts + 1;

                // 25% chance to resolve on retry for demo purposes
                const isSuccess = Math.random() < 0.25;
                const now = new Date();

                if ( isSuccess ) {
                    stmtUpdateResolved.run( now.toISOString(), item.id );
                    resolved++;
                } else if ( newAttempts >= 5 ) { // Max 5 attempts
                    stmtUpdateFailed.run( now.toISOString(), item.id );
                } else {
                    // Exponential backoff: attempt 1 -> 1 min, attempt 2 -> 2 min, attempt 3 -> 4 min
                    const minutesToAdd = Math.pow( 2, newAttempts - 1 );
                    const nextRetry = new Date( now.getTime() + minutesToAdd * 60000 );

                    stmtUpdatePending.run( newAttempts, nextRetry.toISOString(), now.toISOString(), item.id );
                }
            }

            return NextResponse.json( { success: true, processed, resolved } );
        }

        return NextResponse.json( { error: 'Invalid action' }, { status: 400 } );

    } catch ( error: any ) {
        console.error( 'Error in retry queue API:', error );
        return NextResponse.json( { error: 'Action failed', details: error.message }, { status: 500 } );
    }
}
