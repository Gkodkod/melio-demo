import { NextResponse } from 'next/server';
import { getDb, mapDevWebhookLog } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
    try {
        const supabase = getDb();
        const { data: rows, error } = await supabase
            .from( 'dev_webhook_logs' )
            .select( '*' )
            .order( 'created_at', { ascending: false } )
            .limit( 50 );
        if ( error ) throw error;
        const logs = ( rows ?? [] ).map( r => mapDevWebhookLog( r as Record<string, unknown> ) );
        return NextResponse.json( logs );
    } catch ( error ) {
        console.error( 'Error fetching webhook logs:', error );
        return NextResponse.json( { error: 'Failed to fetch webhook logs' }, { status: 500 } );
    }
}

export async function POST( request: Request ) {
    try {
        const body = await request.json();
        const { event_type } = body;
        if ( !event_type ) return NextResponse.json( { error: 'Missing event_type' }, { status: 400 } );

        const supabase = getDb();
        const eventId = `evt_${crypto.randomBytes( 12 ).toString( 'hex' )}`;
        const paymentId = `pi_${crypto.randomBytes( 12 ).toString( 'hex' )}`;

        const payload = {
            id: eventId, object: 'event', api_version: '2023-10-16',
            created: Math.floor( Date.now() / 1000 ), type: event_type,
            data: {
                object: {
                    id: paymentId, object: 'payment_intent',
                    amount: Math.floor( Math.random() * 10000 ) + 1000, currency: 'usd',
                    status: event_type === 'payment.succeeded' ? 'succeeded' :
                        event_type === 'payment.failed' ? 'failed' : 'processing',
                }
            }
        };

        await new Promise( resolve => setTimeout( resolve, Math.random() * 800 ) );
        const isFailed = Math.random() < 0.2;
        const status = isFailed ? 'failed' : 'delivered';
        const logId = crypto.randomUUID();
        const now = new Date().toISOString();

        const { error } = await supabase.from( 'dev_webhook_logs' ).insert( {
            id: logId, event_type, payload: JSON.stringify( payload ),
            status, delivery_attempts: 1, last_attempt_at: now, created_at: now,
        } );
        if ( error ) throw error;

        return NextResponse.json( {
            id: logId, status,
            message: status === 'delivered' ? 'Webhook delivered successfully' : 'Webhook delivery failed',
        } );
    } catch ( error ) {
        console.error( 'Error simulating webhook:', error );
        return NextResponse.json( { error: 'Failed to simulate webhook' }, { status: 500 } );
    }
}

export async function PUT( request: Request ) {
    try {
        const body = await request.json();
        const { id } = body;
        if ( !id ) return NextResponse.json( { error: 'Missing webhook log id' }, { status: 400 } );

        await new Promise( resolve => setTimeout( resolve, 600 ) );
        const isFailed = Math.random() < 0.1;
        const status = isFailed ? 'failed' : 'delivered';
        const supabase = getDb();

        const { data: current } = await supabase
            .from( 'dev_webhook_logs' )
            .select( 'delivery_attempts' )
            .eq( 'id', id )
            .single();

        const { error } = await supabase.from( 'dev_webhook_logs' ).update( {
            status,
            delivery_attempts: ( ( current as { delivery_attempts: number } | null )?.delivery_attempts ?? 0 ) + 1,
            last_attempt_at: new Date().toISOString(),
        } ).eq( 'id', id );
        if ( error ) throw error;

        return NextResponse.json( { id, status } );
    } catch ( error ) {
        console.error( 'Error retrying webhook:', error );
        return NextResponse.json( { error: 'Failed to retry webhook' }, { status: 500 } );
    }
}

export const dynamic = 'force-dynamic';

