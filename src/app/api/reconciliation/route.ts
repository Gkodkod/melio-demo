import { NextResponse } from 'next/server';
import { reconciliationRecords } from '@/lib/mock-data';

export async function GET() {
    return NextResponse.json( reconciliationRecords );
}
