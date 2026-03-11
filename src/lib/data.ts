import { getDb, mapVendor, mapInvoice, mapPayment } from './db';
import { Vendor, Invoice, Payment } from './types';

export async function getVendors(): Promise<Vendor[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'vendors' )
        .select( '*' )
        .order( 'name', { ascending: true } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapVendor( r as Record<string, unknown> ) as Vendor );
}

export async function getVendorById( id: string ): Promise<Vendor | null> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'vendors' )
        .select( '*' )
        .eq( 'id', id )
        .single();
    
    if ( error ) return null;
    return mapVendor( data as Record<string, unknown> ) as Vendor;
}

export async function getInvoices(): Promise<Invoice[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'invoices' )
        .select( '*' )
        .order( 'created_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapInvoice( r as Record<string, unknown> ) as Invoice );
}

export async function getPayments(): Promise<Payment[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'payments' )
        .select( '*' )
        .order( 'created_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapPayment( r as Record<string, unknown> ) as Payment );
}

export async function getPaymentsByVendorId( vendorId: string ): Promise<Payment[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'payments' )
        .select( '*' )
        .eq( 'vendor_id', vendorId )
        .order( 'created_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapPayment( r as Record<string, unknown> ) as Payment );
}

export async function getInvoicesByVendorId( vendorId: string ): Promise<Invoice[]> {
    const supabase = getDb();
    const { data, error } = await supabase
        .from( 'invoices' )
        .select( '*' )
        .eq( 'vendor_id', vendorId )
        .order( 'created_at', { ascending: false } );
    
    if ( error ) throw new Error( error.message );
    return ( data ?? [] ).map( ( r ) => mapInvoice( r as Record<string, unknown> ) as Invoice );
}
