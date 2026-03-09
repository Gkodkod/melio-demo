import { NextResponse } from 'next/server';
import { getDb, mapDevApiKey } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
    try {
        const db = getDb();
        const rows = db.prepare( `SELECT * FROM dev_api_keys WHERE status = 'active'` ).all() as Record<string, unknown>[];
        const keys = rows.map( mapDevApiKey );

        // If no keys exist, create a default set
        if ( keys.length === 0 ) {
            const newKey = generateNewKey();
            db.prepare( `
                INSERT INTO dev_api_keys (id, publishable_key, secret_key, name, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ` ).run( newKey.id, newKey.publishableKey, newKey.secretKey, newKey.name, newKey.status, newKey.createdAt );

            return NextResponse.json( [newKey] );
        }

        return NextResponse.json( keys );
    } catch ( error ) {
        console.error( 'Error fetching API keys:', error );
        return NextResponse.json( { error: 'Failed to fetch API keys' }, { status: 500 } );
    }
}

export async function POST( request: Request ) {
    try {
        const body = await request.json();
        const { action } = body;

        const db = getDb();

        if ( action === 'rotate' ) {
            // Revoke all existing
            db.prepare( `UPDATE dev_api_keys SET status = 'revoked' WHERE status = 'active'` ).run();

            // Create new
            const newKey = generateNewKey();
            db.prepare( `
                INSERT INTO dev_api_keys (id, publishable_key, secret_key, name, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ` ).run( newKey.id, newKey.publishableKey, newKey.secretKey, newKey.name, newKey.status, newKey.createdAt );

            return NextResponse.json( newKey );
        }

        return NextResponse.json( { error: 'Invalid action' }, { status: 400 } );
    } catch ( error ) {
        console.error( 'Error managing API keys:', error );
        return NextResponse.json( { error: 'Failed to manage API keys' }, { status: 500 } );
    }
}

function generateNewKey() {
    return {
        id: crypto.randomUUID(),
        publishableKey: `pk_test_${crypto.randomBytes( 12 ).toString( 'hex' )}`,
        secretKey: `sk_test_${crypto.randomBytes( 24 ).toString( 'hex' )}`,
        name: 'Default Test Key',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
    };
}
