import { NextResponse } from 'next/server';
import { getDb, mapFraudAlert, mapPayment, mapVendor, mapTransactionEvent } from '@/lib/db';

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const db = getDb();
    const { id } = params;

    // Fraud alert
    const alertRow = db.prepare( 'SELECT * FROM fraud_alerts WHERE id = ?' ).get( id );
    if ( !alertRow ) {
        return NextResponse.json( { error: 'Alert not found' }, { status: 404 } );
    }
    const alert = mapFraudAlert( alertRow as Record<string, unknown> );

    // Payment
    const paymentRow = db.prepare( 'SELECT * FROM payments WHERE id = ?' ).get( alert.paymentId );
    const payment = paymentRow ? mapPayment( paymentRow as Record<string, unknown> ) : null;

    // Vendor
    const vendorRow = db.prepare( 'SELECT * FROM vendors WHERE id = ?' ).get( alert.vendorId );
    const vendor = vendorRow ? mapVendor( vendorRow as Record<string, unknown> ) : null;

    // Vendor risk profile
    const vendorPaymentCount = ( db.prepare(
        'SELECT COUNT(*) as c FROM payments WHERE vendor_id = ?'
    ).get( alert.vendorId ) as { c: number } ).c;
    const vendorAvgAmount = ( db.prepare(
        'SELECT COALESCE(AVG(amount), 0) as a FROM payments WHERE vendor_id = ?'
    ).get( alert.vendorId ) as { a: number } ).a;
    const vendorTotalVolume = ( db.prepare(
        'SELECT COALESCE(SUM(amount), 0) as s FROM payments WHERE vendor_id = ?'
    ).get( alert.vendorId ) as { s: number } ).s;

    // Transaction events for this payment
    const eventRows = db.prepare(
        'SELECT * FROM transaction_events WHERE payment_id = ? ORDER BY timestamp ASC'
    ).all( alert.paymentId );
    const events = eventRows.map( ( r ) => mapTransactionEvent( r as Record<string, unknown> ) );

    return NextResponse.json( {
        alert,
        payment,
        vendor,
        vendorRiskProfile: {
            paymentCount: vendorPaymentCount,
            avgAmount: Math.round( vendorAvgAmount * 100 ) / 100,
            totalVolume: Math.round( vendorTotalVolume * 100 ) / 100,
            vendorAge: vendor ? Math.floor(
                ( Date.now() - new Date( vendor.createdAt as string ).getTime() ) / ( 1000 * 60 * 60 * 24 )
            ) : 0,
        },
        events,
    } );
}
