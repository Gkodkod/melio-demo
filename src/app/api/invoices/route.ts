import { NextResponse } from 'next/server';
import { invoices } from '@/lib/mock-data';

export async function GET() {
    return NextResponse.json( invoices );
}
