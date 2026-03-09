import { NextResponse } from 'next/server';
import { getDb, mapFraudAlert, mapPayment, mapVendor, mapTransactionEvent } from '@/lib/db';

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const supabase = getDb();
    const { id } = params;

    // Fraud alert
    const { data: alertRow, error: alertErr } = await supabase
        .from( 'fraud_alerts' )
        .select( '*' )
        .eq( 'id', id )
        .single();
    if ( alertErr || !alertRow ) return NextResponse.json( { error: 'Alert not found' }, { status: 404 } );
    const alert = mapFraudAlert( alertRow as Record<string, unknown> );

    // Payment, vendor, transaction events, and vendor aggregate stats — in parallel
    const [
        { data: paymentRow },
        { data: vendorRow },
        { data: eventRows },
        { data: vendorPayments },
    ] = await Promise.all( [
        supabase.from( 'payments' ).select( '*' ).eq( 'id', alert.paymentId ).single(),
        supabase.from( 'vendors' ).select( '*' ).eq( 'id', alert.vendorId ).single(),
        supabase.from( 'transaction_events' ).select( '*' ).eq( 'payment_id', alert.paymentId ).order( 'timestamp', { ascending: true } ),
        supabase.from( 'payments' ).select( 'amount' ).eq( 'vendor_id', alert.vendorId ),
    ] );

    const payment = paymentRow ? mapPayment( paymentRow as Record<string, unknown> ) : null;
    const vendor = vendorRow ? mapVendor( vendorRow as Record<string, unknown> ) : null;
    const events = ( eventRows ?? [] ).map( ( r ) => mapTransactionEvent( r as Record<string, unknown> ) );

    const amounts = ( vendorPayments ?? [] ).map( ( r: { amount: number } ) => r.amount );
    const vendorPaymentCount = amounts.length;
    const vendorTotalVolume = Math.round( amounts.reduce( ( s, v ) => s + v, 0 ) * 100 ) / 100;
    const vendorAvgAmount = vendorPaymentCount
        ? Math.round( ( vendorTotalVolume / vendorPaymentCount ) * 100 ) / 100
        : 0;

    return NextResponse.json( {
        alert,
        payment,
        vendor,
        vendorRiskProfile: {
            paymentCount: vendorPaymentCount,
            avgAmount: vendorAvgAmount,
            totalVolume: vendorTotalVolume,
            vendorAge: vendor
                ? Math.floor( ( Date.now() - new Date( vendor.createdAt as string ).getTime() ) / ( 1000 * 60 * 60 * 24 ) )
                : 0,
        },
        events,
    } );
}
