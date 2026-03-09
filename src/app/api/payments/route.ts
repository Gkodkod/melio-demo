import { NextResponse } from 'next/server';
import { getDb, mapPayment } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'payments' )
        .select( '*' )
        .order( 'created_at', { ascending: false } );
    if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
    return NextResponse.json( ( data ?? [] ).map( ( r ) => mapPayment( r as Record<string, unknown> ) ) );
}

export async function POST( request: Request ) {
    try {
        const body = await request.json();
        const {
            vendorId, invoiceId, amount, paymentMethod, scheduledDate,
            vendorCurrency, usdAmount, foreignAmount, fxRate, fxTimestamp,
            marketFxRate, fxSpread, fxFeeAmount, transferFeeAmount
        } = body;

        // Basic validation
        if ( !vendorId || !invoiceId || !amount || !paymentMethod || !scheduledDate ) {
            return NextResponse.json( { error: 'Missing required fields' }, { status: 400 } );
        }

        const today = new Date().toISOString().split( 'T' )[0];
        if ( scheduledDate < today ) {
            return NextResponse.json( { error: 'Cannot schedule payment in the past' }, { status: 400 } );
        }

        const supabase = getDb();

        // Fetch vendor and invoice details (to keep denormalized data in payments table)
        const { data: vendor, error: vendorError } = await supabase.from( 'vendors' ).select( 'name' ).eq( 'id', vendorId ).single();
        if ( vendorError || !vendor ) return NextResponse.json( { error: 'Vendor not found' }, { status: 400 } );

        const { data: invoice, error: invoiceError } = await supabase.from( 'invoices' ).select( 'invoice_number' ).eq( 'id', invoiceId ).single();
        if ( invoiceError || !invoice ) return NextResponse.json( { error: 'Invoice not found' }, { status: 400 } );

        const newPaymentId = `pm_${crypto.randomBytes( 12 ).toString( 'hex' )}`;
        const newPayment = {
            id: newPaymentId,
            vendor_id: vendorId,
            vendor_name: vendor.name,
            invoice_id: invoiceId,
            invoice_number: invoice.invoice_number,
            amount,
            payment_method: paymentMethod,
            status: scheduledDate === today ? 'processing' : 'scheduled',
            scheduled_date: scheduledDate,
            vendor_currency: vendorCurrency,
            usd_amount: usdAmount,
            foreign_amount: foreignAmount,
            fx_rate: fxRate,
            fx_timestamp: fxTimestamp,
            market_fx_rate: marketFxRate,
            fx_spread: fxSpread,
            fx_fee_amount: fxFeeAmount,
            transfer_fee_amount: transferFeeAmount,
            created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from( 'payments' ).insert( newPayment );

        if ( error ) {
            console.error( 'Error inserting payment:', error );
            return NextResponse.json( { error: error.message }, { status: 500 } );
        }

        // Add a transaction event for the creation
        const newEvent = {
            id: `evt_${crypto.randomBytes( 12 ).toString( 'hex' )}`,
            payment_id: newPaymentId,
            type: 'payment.created',
            vendor_name: vendor.name,
            amount: amount,
            payment_method: paymentMethod,
            status: newPayment.status,
            vendor_currency: vendorCurrency,
            usd_amount: usdAmount,
            foreign_amount: foreignAmount,
            fx_rate: fxRate,
            fx_timestamp: fxTimestamp,
            timestamp: new Date().toISOString()
        };
        const { error: eventError } = await supabase.from( 'transaction_events' ).insert( newEvent );
        if ( eventError ) {
            console.error( 'Error recording transaction event:', eventError );
            // We don't fail the payment creation if the event log fails
        }

        return NextResponse.json( mapPayment( newPayment ) );
    } catch ( error: unknown ) {
        console.error( 'API Error:', error );
        return NextResponse.json( { error: 'Internal Server Error' }, { status: 500 } );
    }
}

export const dynamic = 'force-dynamic';

