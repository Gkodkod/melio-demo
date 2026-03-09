import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    const supabase = getDb();

    const [
        { count: total },
        { count: pending },
        { count: completed },
        { count: failed },
        { data: volumeAll },
        { data: volumePending },
    ] = await Promise.all( [
        supabase.from( 'payments' ).select( '*', { count: 'exact', head: true } ),
        supabase.from( 'payments' ).select( '*', { count: 'exact', head: true } ).in( 'status', ['scheduled', 'draft'] ),
        supabase.from( 'payments' ).select( '*', { count: 'exact', head: true } ).eq( 'status', 'settled' ),
        supabase.from( 'payments' ).select( '*', { count: 'exact', head: true } ).eq( 'status', 'failed' ),
        supabase.from( 'payments' ).select( 'amount' ),
        supabase.from( 'payments' ).select( 'amount' ).in( 'status', ['scheduled', 'draft', 'processing'] ),
    ] );

    const totalVolume = ( volumeAll ?? [] ).reduce( ( sum: number, r: { amount: number } ) => sum + ( r.amount ?? 0 ), 0 );
    const pendingVolume = ( volumePending ?? [] ).reduce( ( sum: number, r: { amount: number } ) => sum + ( r.amount ?? 0 ), 0 );

    return NextResponse.json( {
        totalPayments: total ?? 0,
        pendingPayments: pending ?? 0,
        completedPayments: completed ?? 0,
        failedPayments: failed ?? 0,
        totalVolume,
        pendingVolume,
    } );
}

export const dynamic = 'force-dynamic';

