export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDb, mapDevApiKey } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
    try {
        const supabase = getDb();
        const { data: rows, error } = await supabase
            .from( 'dev_api_keys' )
            .select( '*' )
            .eq( 'status', 'active' );
        if ( error ) throw error;

        const keys = ( rows ?? [] ).map( r => mapDevApiKey( r as Record<string, unknown> ) );

        if ( keys.length === 0 ) {
            const newKey = generateNewKey();
            const { error: insertErr } = await supabase.from( 'dev_api_keys' ).insert( {
                id: newKey.id,
                publishable_key: newKey.publishableKey,
                secret_key: newKey.secretKey,
                name: newKey.name,
                status: newKey.status,
                created_at: newKey.createdAt,
            } );
            if ( insertErr ) throw insertErr;
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
        const supabase = getDb();

        if ( action === 'rotate' ) {
            const { error: revokeErr } = await supabase
                .from( 'dev_api_keys' )
                .update( { status: 'revoked' } )
                .eq( 'status', 'active' );
            if ( revokeErr ) throw revokeErr;

            const newKey = generateNewKey();
            const { error: insertErr } = await supabase.from( 'dev_api_keys' ).insert( {
                id: newKey.id,
                publishable_key: newKey.publishableKey,
                secret_key: newKey.secretKey,
                name: newKey.name,
                status: newKey.status,
                created_at: newKey.createdAt,
            } );
            if ( insertErr ) throw insertErr;
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
