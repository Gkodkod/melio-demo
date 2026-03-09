import { NextResponse } from 'next/server';
import { transactionEvents } from '@/lib/mock-data';

export async function GET() {
    const sorted = [...transactionEvents].sort(
        ( a, b ) => new Date( b.timestamp ).getTime() - new Date( a.timestamp ).getTime()
    );
    return NextResponse.json( sorted );
}
