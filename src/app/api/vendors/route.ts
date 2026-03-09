import { NextResponse } from 'next/server';
import { vendors } from '@/lib/mock-data';

export async function GET() {
    return NextResponse.json( vendors );
}
