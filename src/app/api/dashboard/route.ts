import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const db = getDb();

    const total = ( db.prepare( 'SELECT COUNT(*) as c FROM payments' ).get() as { c: number } ).c;
    const pending = ( db.prepare( "SELECT COUNT(*) as c FROM payments WHERE status IN ('scheduled', 'draft')" ).get() as { c: number } ).c;
    const completed = ( db.prepare( "SELECT COUNT(*) as c FROM payments WHERE status = 'settled'" ).get() as { c: number } ).c;
    const failed = ( db.prepare( "SELECT COUNT(*) as c FROM payments WHERE status = 'failed'" ).get() as { c: number } ).c;
    const totalVolume = ( db.prepare( 'SELECT COALESCE(SUM(amount), 0) as s FROM payments' ).get() as { s: number } ).s;
    const pendingVolume = ( db.prepare( "SELECT COALESCE(SUM(amount), 0) as s FROM payments WHERE status IN ('scheduled', 'draft', 'processing')" ).get() as { s: number } ).s;

    return NextResponse.json( {
        totalPayments: total,
        pendingPayments: pending,
        completedPayments: completed,
        failedPayments: failed,
        totalVolume,
        pendingVolume,
    } );
}
