import { NextResponse } from 'next/server';
import { payments } from '@/lib/mock-data';

export async function GET() {
    return NextResponse.json( payments );
}
