import { NextResponse } from 'next/server';
import { getDb, mapVendor } from '@/lib/db';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = getDb();
    const { id } = await params;
    const { data, error } = await supabase
        .from( 'vendors' )
        .select( '*' )
        .eq( 'id', id )
        .single();
    if ( error || !data ) return NextResponse.json( { error: 'Vendor not found' }, { status: 404 } );
    return NextResponse.json( mapVendor( data as Record<string, unknown> ) );
}
