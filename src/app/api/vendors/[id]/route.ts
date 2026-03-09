import { NextResponse } from 'next/server';
import { vendors } from '@/lib/mock-data';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const vendor = vendors.find( ( v ) => v.id === params.id );
    if ( !vendor ) {
        return NextResponse.json( { error: 'Vendor not found' }, { status: 404 } );
    }
    return NextResponse.json( vendor );
}
