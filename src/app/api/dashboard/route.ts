import { NextResponse } from 'next/server';
import { payments } from '@/lib/mock-data';

export async function GET() {
    const total = payments.length;
    const pending = payments.filter( ( p ) => p.status === 'scheduled' || p.status === 'draft' ).length;
    const completed = payments.filter( ( p ) => p.status === 'settled' ).length;
    const failed = payments.filter( ( p ) => p.status === 'failed' ).length;
    const totalVolume = payments.reduce( ( sum, p ) => sum + p.amount, 0 );
    const pendingVolume = payments
        .filter( ( p ) => p.status === 'scheduled' || p.status === 'draft' || p.status === 'processing' )
        .reduce( ( sum, p ) => sum + p.amount, 0 );

    return NextResponse.json( {
        totalPayments: total,
        pendingPayments: pending,
        completedPayments: completed,
        failedPayments: failed,
        totalVolume,
        pendingVolume,
    } );
}
