import { NextResponse } from 'next/server';
import { getFxRate } from '@/lib/fx-service';

export async function GET( request: Request ) {
    try {
        const { searchParams } = new URL( request.url );
        const base = searchParams.get( 'base' ) || 'USD';
        const target = searchParams.get( 'target' );

        if ( !target ) {
            return NextResponse.json( { error: 'Target currency is required' }, { status: 400 } );
        }

        const marketRate = await getFxRate( base, target );
        const timestamp = new Date().toISOString();
        const spreadPercentage = 0.006; // 0.6% markup
        const platformRate = marketRate * ( 1 + spreadPercentage );

        return NextResponse.json( {
            base,
            target,
            marketRate,
            platformRate,
            spreadPercentage,
            timestamp
        } );
    } catch ( error ) {
        console.error( 'Error fetching FX rate:', error );
        return NextResponse.json( { error: 'Failed to fetch FX rate' }, { status: 500 } );
    }
}

export const dynamic = 'force-dynamic';
