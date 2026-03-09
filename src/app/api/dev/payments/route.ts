export const dynamic = 'force-dynamic';
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
        const supabase = getDb();

        if ( idempotencyKey ) {
            const { data: existingKey } = await supabase
                .from( 'idempotency_keys' )
                .select( 'response_payload' )
                .eq( 'key', idempotencyKey )
                .eq( 'endpoint', '/api/dev/payments' )
                .single();
            if ( existingKey ) {
                responsePayload = JSON.parse( existingKey.response_payload );
                return NextResponse.json( responsePayload, { status: 200 } );
            }
        }

        requestPayload = await request.json();
        const { amount, currency, vendor_id, payment_method, description } = requestPayload as {
            amount: number; currency: string; vendor_id: string; payment_method: string; description?: string;
        };

        if ( !amount || !currency || !vendor_id || !payment_method ) {
            statusCode = 400;
            responsePayload = { error: { message: 'Missing required parameters', type: 'invalid_request_error' } };
            return NextResponse.json( responsePayload, { status: statusCode } );
        }

        await new Promise( resolve => setTimeout( resolve, 600 + Math.random() * 400 ) );

        const paymentId = `pi_${crypto.randomBytes( 12 ).toString( 'hex' )}`;
        responsePayload = {
            id: paymentId, object: 'payment_intent', amount, currency, vendor_id,
            payment_method, description: description || null, status: 'succeeded',
            created: Math.floor( Date.now() / 1000 ), livemode: false,
        };

        if ( idempotencyKey ) {
            await supabase.from( 'idempotency_keys' ).insert( {
                key: idempotencyKey,
                endpoint: '/api/dev/payments',
                response_payload: JSON.stringify( responsePayload ),
                created_at: new Date().toISOString(),
            } );
        }

        return NextResponse.json( responsePayload, { status: statusCode } );

    } catch ( error: unknown ) {
        statusCode = 500;
        responsePayload = { error: { message: error instanceof Error ? error.message : 'Internal server error', type: 'api_error' } };
        return NextResponse.json( responsePayload, { status: statusCode } );
    } finally {
        const latencyMs = Date.now() - startTime;
        try {
            const supabase = getDb();
            await supabase.from( 'dev_api_logs' ).insert( {
                id: crypto.randomUUID(),
                endpoint: '/v1/payment_intents',
                method: 'POST',
                status_code: statusCode,
                latency_ms: latencyMs,
                request_payload: requestPayload ? JSON.stringify( requestPayload ) : null,
                response_payload: responsePayload ? JSON.stringify( responsePayload ) : null,
                created_at: new Date().toISOString(),
            } );
        } catch ( logError ) {
            console.error( 'Failed to log API request:', logError );
        }
    }
}
