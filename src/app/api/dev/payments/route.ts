import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST( request: Request ) {
    const startTime = Date.now();
    let requestPayload: unknown = null;
    let responsePayload: unknown = null;
    let statusCode = 200;

    try {
        const authHeader = request.headers.get( 'Authorization' );
        if ( !authHeader || !authHeader.startsWith( 'Bearer sk_test_' ) ) {
            statusCode = 401;
            responsePayload = { error: { message: 'Invalid or missing API key', type: 'authentication_error' } };
            return NextResponse.json( responsePayload, { status: statusCode } );
        }

        const idempotencyKey = request.headers.get( 'Idempotency-Key' );
        const db = getDb();

        if ( idempotencyKey ) {
            const existingKey = db.prepare( 'SELECT response_payload FROM idempotency_keys WHERE key = ? AND endpoint = ?' ).get( idempotencyKey, '/api/dev/payments' ) as { response_payload: string } | undefined;
            if ( existingKey ) {
                responsePayload = JSON.parse( existingKey.response_payload );
                return NextResponse.json( responsePayload, { status: 200 } );
            }
        }

        requestPayload = await request.json();
        const { amount, currency, vendor_id, payment_method, description } = requestPayload as any;

        if ( !amount || !currency || !vendor_id || !payment_method ) {
            statusCode = 400;
            responsePayload = { error: { message: 'Missing required parameters', type: 'invalid_request_error' } };
            return NextResponse.json( responsePayload, { status: statusCode } );
        }

        // Simulate processing time
        await new Promise( resolve => setTimeout( resolve, 600 + Math.random() * 400 ) );

        const paymentId = `pi_${crypto.randomBytes( 12 ).toString( 'hex' )}`;

        responsePayload = {
            id: paymentId,
            object: 'payment_intent',
            amount,
            currency,
            vendor_id,
            payment_method,
            description: description || null,
            status: 'succeeded',
            created: Math.floor( Date.now() / 1000 ),
            livemode: false,
        };

        if ( idempotencyKey ) {
            db.prepare( `
                INSERT INTO idempotency_keys (key, endpoint, response_payload, created_at)
                VALUES (?, ?, ?, ?)
            ` ).run(
                idempotencyKey,
                '/api/dev/payments',
                JSON.stringify( responsePayload ),
                new Date().toISOString()
            );
        }

        return NextResponse.json( responsePayload, { status: statusCode } );

    } catch ( error: any ) {
        statusCode = 500;
        responsePayload = { error: { message: error.message || 'Internal server error', type: 'api_error' } };
        return NextResponse.json( responsePayload, { status: statusCode } );
    } finally {
        const latencyMs = Date.now() - startTime;
        try {
            const db = getDb();
            db.prepare( `
                INSERT INTO dev_api_logs (id, endpoint, method, status_code, latency_ms, request_payload, response_payload, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ` ).run(
                crypto.randomUUID(),
                '/v1/payment_intents',
                'POST',
                statusCode,
                latencyMs,
                requestPayload ? JSON.stringify( requestPayload ) : null,
                responsePayload ? JSON.stringify( responsePayload ) : null,
                new Date().toISOString()
            );
        } catch ( logError ) {
            console.error( 'Failed to log API request:', logError );
        }
    }
}
