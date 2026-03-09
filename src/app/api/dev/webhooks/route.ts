import { NextResponse } from 'next/server';
import { getDb, mapDevWebhookLog } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
    try {
        const db = getDb();
        const rows = db.prepare( `
            SELECT * FROM dev_webhook_logs
            ORDER BY created_at DESC
            LIMIT 50
        ` ).all() as Record<string, unknown>[];
        const logs = rows.map( mapDevWebhookLog );

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

        if ( !event_type ) {
            return NextResponse.json( { error: 'Missing event_type' }, { status: 400 } );
        }

        const db = getDb();
        const eventId = `evt_${crypto.randomBytes( 12 ).toString( 'hex' )}`;
        const paymentId = `pi_${crypto.randomBytes( 12 ).toString( 'hex' )}`;

        const payload = {
            id: eventId,
            object: 'event',
            api_version: '2023-10-16',
            created: Math.floor( Date.now() / 1000 ),
            type: event_type,
            data: {
                object: {
                    id: paymentId,
                    object: 'payment_intent',
                    amount: Math.floor( Math.random() * 10000 ) + 1000,
                    currency: 'usd',
                    status: event_type === 'payment.succeeded' ? 'succeeded' :
                        event_type === 'payment.failed' ? 'failed' : 'processing',
                }
            }
        };

        // Simulate delivery delay
        await new Promise( resolve => setTimeout( resolve, Math.random() * 800 ) );

        // Simulate 20% failure rate for realism
        const isFailed = Math.random() < 0.2;
        const status = isFailed ? 'failed' : 'delivered';

        const logId = crypto.randomUUID();
        db.prepare( `
            INSERT INTO dev_webhook_logs (id, event_type, payload, status, delivery_attempts, last_attempt_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ` ).run(
            logId,
            event_type,
            JSON.stringify( payload ),
            status,
            1,
            new Date().toISOString(),
            new Date().toISOString()
        );

        return NextResponse.json( {
            id: logId,
            status,
            message: status === 'delivered' ? 'Webhook delivered successfully' : 'Webhook delivery failed'
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

        if ( !id ) {
            return NextResponse.json( { error: 'Missing webhook log id' }, { status: 400 } );
        }

        const db = getDb();

        // Simulating retry delay and random success/failure
        await new Promise( resolve => setTimeout( resolve, 600 ) );
        const isFailed = Math.random() < 0.1; // lower failure rate on retry
        const status = isFailed ? 'failed' : 'delivered';

        db.prepare( `
            UPDATE dev_webhook_logs 
            SET status = ?, delivery_attempts = delivery_attempts + 1, last_attempt_at = ?
            WHERE id = ?
        ` ).run( status, new Date().toISOString(), id );

        return NextResponse.json( { id, status } );
    } catch ( error ) {
        console.error( 'Error retrying webhook:', error );
        return NextResponse.json( { error: 'Failed to retry webhook' }, { status: 500 } );
    }
}
