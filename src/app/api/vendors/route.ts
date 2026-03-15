import { NextResponse } from 'next/server';
import { getDb, mapVendor } from '@/lib/db';

export async function GET() {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'vendors' )
        .select( '*' )
        .order( 'name', { ascending: true } );
    if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
    return NextResponse.json( ( data ?? [] ).map( ( r ) => mapVendor( r as Record<string, unknown> ) ) );
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Basic validation
        if (!body.name || !body.email || !body.paymentMethod || !body.accountLast4) {
             return NextResponse.json( { error: 'Missing required fields' }, { status: 400 } );
        }

        const supabase = getDb();
        const vendorId = crypto.randomUUID();
        const { data, error } = await supabase
            .from('vendors')
            .insert({
                id: vendorId,
                name: body.name,
                email: body.email,
                phone: body.phone,
                address: body.address,
                payment_method: body.paymentMethod,
                bank_name: body.bankName || null,
                account_last4: body.accountLast4,
                routing_number: body.routingNumber || null,
                bank_verification_status: 'pending', // Default status for new vendors
                total_paid: 0, // Default starting total
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
             console.error('Database error when adding vendor:', error);
             return NextResponse.json( { error: error.message }, { status: 500 } );
        }

        return NextResponse.json( mapVendor( data as Record<string, unknown> ), { status: 201 } );
    } catch (error: any) {
        console.error('Error in POST /api/vendors:', error);
        return NextResponse.json( { error: 'Invalid request' }, { status: 400 } );
    }
}

export const dynamic = 'force-dynamic';

