'use server';
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function generateApiKey( partnerId: string ) {
    const db = getDb();
    const id = `key-${Math.random().toString( 36 ).substr( 2, 9 )}`;
    const prefix = 'pk_live_';
    const randomPart = Math.random().toString( 36 ).substr( 2, 10 ).padEnd( 10, '0' ) + Math.random().toString( 36 ).substr( 2, 10 ).padEnd( 10, '0' );
    const keyValue = `${prefix}${partnerId.replace( '-', '' )}_${randomPart}`;
    const now = new Date().toISOString();

    db.prepare( 'INSERT INTO partner_api_keys (id, partner_id, key_value, status, created_at) VALUES (?, ?, ?, ?, ?)' ).run( id, partnerId, keyValue, 'active', now );
    revalidatePath( `/partner-portal/${partnerId}` );
}

export async function revokeApiKey( keyId: string, partnerId: string ) {
    const db = getDb();
    db.prepare( "UPDATE partner_api_keys SET status = 'revoked' WHERE id = ?" ).run( keyId );
    revalidatePath( `/partner-portal/${partnerId}` );
}

export async function addWebhook( partnerId: string, eventType: string ) {
    const db = getDb();
    const id = `sub-${Math.random().toString( 36 ).substr( 2, 9 )}`;
    const now = new Date().toISOString();
    try {
        db.prepare( 'INSERT INTO partner_webhook_subscriptions (id, partner_id, event_type, created_at) VALUES (?, ?, ?, ?)' ).run( id, partnerId, eventType, now );
        revalidatePath( `/partner-portal/${partnerId}` );
    } catch {
        // Ignore if error occurs
    }
}

export async function removeWebhook( subId: string, partnerId: string ) {
    const db = getDb();
    db.prepare( 'DELETE FROM partner_webhook_subscriptions WHERE id = ?' ).run( subId );
    revalidatePath( `/partner-portal/${partnerId}` );
}

export async function updateWebhookUrl( partnerId: string, url: string ) {
    const db = getDb();
    db.prepare( 'UPDATE partners SET webhook_url = ? WHERE id = ?' ).run( url, partnerId );
    revalidatePath( `/partner-portal/${partnerId}` );
}
