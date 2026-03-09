'use server';
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function generateApiKey( partnerId: string ) {
    const supabase = getDb();
    const id = `key-${Math.random().toString( 36 ).substr( 2, 9 )}`;
    const randomPart = Math.random().toString( 36 ).substr( 2, 10 ).padEnd( 10, '0' ) + Math.random().toString( 36 ).substr( 2, 10 ).padEnd( 10, '0' );
    const keyValue = `pk_live_${partnerId.replace( '-', '' )}_${randomPart}`;
    const now = new Date().toISOString();

    await supabase.from( 'partner_api_keys' ).insert( {
        id, partner_id: partnerId, key_value: keyValue, status: 'active', created_at: now,
    } );
    revalidatePath( `/partner-portal/${partnerId}` );
}

export async function revokeApiKey( keyId: string, partnerId: string ) {
    const supabase = getDb();
    await supabase.from( 'partner_api_keys' ).update( { status: 'revoked' } ).eq( 'id', keyId );
    revalidatePath( `/partner-portal/${partnerId}` );
}

export async function addWebhook( partnerId: string, eventType: string ) {
    const supabase = getDb();
    const id = `sub-${Math.random().toString( 36 ).substr( 2, 9 )}`;
    const now = new Date().toISOString();
    try {
        await supabase.from( 'partner_webhook_subscriptions' ).insert( {
            id, partner_id: partnerId, event_type: eventType, created_at: now,
        } );
        revalidatePath( `/partner-portal/${partnerId}` );
    } catch {
        // Ignore errors
    }
}

export async function removeWebhook( subId: string, partnerId: string ) {
    const supabase = getDb();
    await supabase.from( 'partner_webhook_subscriptions' ).delete().eq( 'id', subId );
    revalidatePath( `/partner-portal/${partnerId}` );
}

export async function updateWebhookUrl( partnerId: string, url: string ) {
    const supabase = getDb();
    await supabase.from( 'partners' ).update( { webhook_url: url } ).eq( 'id', partnerId );
    revalidatePath( `/partner-portal/${partnerId}` );
}
