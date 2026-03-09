import { NextResponse } from 'next/server';
import { getDb, mapLedgerEntry } from '@/lib/db';

export async function GET() {
    try {
        const supabase = getDb();
        const { data, error } = await supabase
            .from( 'ledger_entries' )
            .select( '*' )
            .order( 'created_at', { ascending: false } )
            .limit( 500 );
        if ( error ) return NextResponse.json( { error: error.message }, { status: 500 } );
        const entries = ( data ?? [] ).map( row => mapLedgerEntry( row as Record<string, unknown> ) );
        return NextResponse.json( { entries } );
    } catch ( error ) {
        console.error( 'Error fetching ledger entries:', error );
        return NextResponse.json( { error: 'Internal server error' }, { status: 500 } );
    }
}

export async function POST( request: Request ) {
    try {
        const body = await request.json();
        const { entries, description } = body;

        if ( !entries || !Array.isArray( entries ) || entries.length < 2 ) {
            return NextResponse.json( { error: 'At least two entries (debit and credit) are required' }, { status: 400 } );
        }
        if ( !description ) {
            return NextResponse.json( { error: 'Description is required' }, { status: 400 } );
        }

        let totalDebit = 0;
        let totalCredit = 0;
        for ( const entry of entries ) {
            if ( !entry.accountId ) return NextResponse.json( { error: 'All entries must have an accountId' }, { status: 400 } );
            if ( entry.debit ) totalDebit += Number( entry.debit );
            if ( entry.credit ) totalCredit += Number( entry.credit );
        }
        if ( Math.abs( totalDebit - totalCredit ) > 0.001 ) {
            return NextResponse.json(
                { error: `Unbalanced transaction: Debits (${totalDebit}) do not equal Credits (${totalCredit})` },
                { status: 400 }
            );
        }

        const supabase = getDb();
        const transactionId = 'txn_' + Date.now();
        const now = new Date().toISOString();

        // Fetch all account data needed in parallel
        const accountIds: string[] = entries.map( ( e: { accountId: string } ) => e.accountId );
        const { data: accountRows, error: accErr } = await supabase
            .from( 'ledger_accounts' )
            .select( 'id, name, type' )
            .in( 'id', accountIds );
        if ( accErr ) throw new Error( accErr.message );

        const accountMap = new Map( ( accountRows ?? [] ).map( ( a: { id: string; name: string; type: string } ) => [a.id, a] ) );

        const results = [];
        for ( const entry of entries as { accountId: string; debit?: number; credit?: number }[] ) {
            const account = accountMap.get( entry.accountId ) as { id: string; name: string; type: string } | undefined;
            if ( !account ) throw new Error( `Account not found: ${entry.accountId}` );

            const entryId = 'ent_' + Date.now() + '_' + Math.random().toString( 36 ).substring( 7 );
            const debitVal = entry.debit ? Number( entry.debit ) : null;
            const creditVal = entry.credit ? Number( entry.credit ) : null;

            // Insert ledger entry
            const { error: insertErr } = await supabase.from( 'ledger_entries' ).insert( {
                id: entryId,
                transaction_id: transactionId,
                account_id: entry.accountId,
                account_name: account.name,
                debit: debitVal,
                credit: creditVal,
                description,
                created_at: now,
            } );
            if ( insertErr ) throw new Error( insertErr.message );

            // Update account balance
            let balanceChange = 0;
            if ( account.type === 'asset' || account.type === 'expense' ) {
                balanceChange = ( debitVal || 0 ) - ( creditVal || 0 );
            } else {
                balanceChange = ( creditVal || 0 ) - ( debitVal || 0 );
            }

            const { error: updateErr } = await supabase.rpc( 'increment_account_balance', {
                p_account_id: entry.accountId,
                p_delta: balanceChange,
            } );
            if ( updateErr ) {
                // Fallback: fetch current balance and update manually
                const { data: acc } = await supabase
                    .from( 'ledger_accounts' )
                    .select( 'balance' )
                    .eq( 'id', entry.accountId )
                    .single();
                const newBalance = ( ( acc as { balance: number } | null )?.balance ?? 0 ) + balanceChange;
                await supabase.from( 'ledger_accounts' ).update( { balance: newBalance } ).eq( 'id', entry.accountId );
            }

            results.push( { id: entryId, accountId: entry.accountId, debit: debitVal, credit: creditVal } );
        }

        return NextResponse.json( { success: true, transactionId, entries: results } );
    } catch ( error: unknown ) {
        console.error( 'Error creating ledger entries:', error );
        return NextResponse.json( { error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 } );
    }
}
