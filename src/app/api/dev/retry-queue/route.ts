export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb, mapRetryQueueEntry } from '@/lib/db';
import { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

export async function GET() {
    try {
        const supabase = getDb() as AnyClient;
        const { data: rows, error } = await supabase
            .from( 'retry_queue' )
            .select( '*' )
            .order( 'created_at', { ascending: false } );
        if ( error ) throw error;
        return NextResponse.json( ( rows ?? [] ).map( ( row: Record<string, unknown> ) => mapRetryQueueEntry( row ) ) );
    } catch ( error ) {
        console.error( 'Failed to fetch retry queue:', error );
        return NextResponse.json( { error: 'Failed to fetch retry queue' }, { status: 500 } );
    }
}

export async function POST( request: Request ) {
    try {
        const { action } = await request.json();
        const supabase = getDb() as AnyClient;

        if ( action === 'inject' ) {
            const queueId = `rq_${Date.now()}`;
            const paymentId = `pay_err_${Math.floor( Math.random() * 10000 )}`;
            const now = new Date().toISOString();
            const errorMessages = [
                'Connection reset by peer', 'Timeout querying banking API',
                'Insufficient funds in ledger', 'Rate limit exceeded for provider',
            ];
            const randomError = errorMessages[Math.floor( Math.random() * errorMessages.length )];

            const { error } = await supabase.from( 'retry_queue' ).insert( {
                id: queueId, payment_id: paymentId, error_message: randomError,
                retry_attempts: 0, next_retry_at: now, backoff_policy: 'exponential',
                status: 'pending', created_at: now, updated_at: now,
            } );
            if ( error ) throw error;
            return NextResponse.json( { success: true, queueId } );
        }

        if ( action === 'tick' || action === 'process' ) {
            const { data: pendingItems, error: fetchErr } = await supabase
                .from( 'retry_queue' )
                .select( '*' )
                .eq( 'status', 'pending' );
            if ( fetchErr ) throw fetchErr;

            let processed = 0;
            let resolved = 0;

            for ( const item of ( pendingItems ?? [] ) as { id: string; retry_attempts: number }[] ) {
                processed++;
                const newAttempts = item.retry_attempts + 1;
                const isSuccess = Math.random() < 0.25;
                const now = new Date().toISOString();

                if ( isSuccess ) {
                    await supabase.from( 'retry_queue' ).update( { status: 'resolved', updated_at: now } ).eq( 'id', item.id );
                    resolved++;
                } else if ( newAttempts >= 5 ) {
                    await supabase.from( 'retry_queue' ).update( { status: 'failed', updated_at: now } ).eq( 'id', item.id );
                } else {
                    const minutesToAdd = Math.pow( 2, newAttempts - 1 );
                    const nextRetry = new Date( Date.now() + minutesToAdd * 60000 ).toISOString();
                    await supabase.from( 'retry_queue' ).update( {
                        retry_attempts: newAttempts, next_retry_at: nextRetry, updated_at: now,
                    } ).eq( 'id', item.id );
                }
            }

            return NextResponse.json( { success: true, processed, resolved } );
        }

        return NextResponse.json( { error: 'Invalid action' }, { status: 400 } );

    } catch ( error: unknown ) {
        console.error( 'Error in retry queue API:', error );
        return NextResponse.json( { error: 'Action failed', details: error instanceof Error ? error.message : String( error ) }, { status: 500 } );
    }
}
