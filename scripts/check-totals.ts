import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config( { path: path.join( process.cwd(), '.env.local' ) } );

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
);

async function main() {
    const { data: vendors } = await supabase.from( 'vendors' ).select( 'id, name, total_paid' );
    const { data: payments } = await supabase.from( 'payments' ).select( 'vendor_id, amount, status' );

    let mismatches = 0;
    for ( const v of vendors! ) {
        const vendorPayments = payments!.filter( p => p.vendor_id === v.id && p.status === 'settled' );
        const calculatedTotal = vendorPayments.reduce( ( sum, p ) => sum + Number( p.amount ), 0 );
        const storedTotal = Number( v.total_paid );
        if ( Math.abs( calculatedTotal - storedTotal ) > 0.01 ) {
            console.log( `Mismatch for ${v.name}: stored=${storedTotal}, calc=${calculatedTotal}` );
            mismatches++;
        }
    }
    console.log( `Found ${mismatches} mismatches out of ${vendors!.length}` );
}

main();
