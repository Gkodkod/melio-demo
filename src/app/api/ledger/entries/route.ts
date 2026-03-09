import { NextResponse } from 'next/server';
import { getDb, mapLedgerEntry } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        // Fetch the latest 500 entries for the journal/audit trail
        const rows = db.prepare( 'SELECT * FROM ledger_entries ORDER BY created_at DESC LIMIT 500' ).all();
        const entries = rows.map( row => mapLedgerEntry( row as Record<string, unknown> ) );

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

        // Validate that total debits == total credits
        let totalDebit = 0;
        let totalCredit = 0;

        for ( const entry of entries ) {
            if ( !entry.accountId ) return NextResponse.json( { error: 'All entries must have an accountId' }, { status: 400 } );
            if ( entry.debit ) totalDebit += Number( entry.debit );
            if ( entry.credit ) totalCredit += Number( entry.credit );
        }

        // Use a small epsilon for floating point comparison just in case
        if ( Math.abs( totalDebit - totalCredit ) > 0.001 ) {
            return NextResponse.json( { error: `Unbalanced transaction: Debits (${totalDebit}) do not equal Credits (${totalCredit})` }, { status: 400 } );
        }

        const db = getDb();
        const transactionId = 'txn_' + Date.now();
        const now = new Date().toISOString();

        // Execute the entire double-entry transaction atomically
        const tx = db.transaction( ( txEntries: any[], txnDesc: string ) => {
            const results = [];
            for ( const entry of txEntries ) {
                // Get account name for denormalization
                const accountRow = db.prepare( 'SELECT name FROM ledger_accounts WHERE id = ?' ).get( entry.accountId ) as { name: string } | undefined;
                if ( !accountRow ) throw new Error( `Account not found: ${entry.accountId}` );

                const entryId = 'ent_' + Date.now() + '_' + Math.random().toString( 36 ).substring( 7 );
                const debitVal = entry.debit ? Number( entry.debit ) : null;
                const creditVal = entry.credit ? Number( entry.credit ) : null;

                // Insert entry
                db.prepare( `
                    INSERT INTO ledger_entries (id, transaction_id, account_id, account_name, debit, credit, description, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ` ).run( entryId, transactionId, entry.accountId, accountRow.name, debitVal, creditVal, txnDesc, now );

                // Update account balance
                // Normal balance logic: Assets increase with Debit, Liabilities/Equity increase with Credit.
                // However, the simplest universal approach for a generic balance field is to just strictly add debits and subtract credits
                // OR add credits and subtract debits. 
                // Let's adopt standard accounting: Balance = sum(credits) - sum(debits) for liability/equity/revenue, 
                // but since these are all in one table without sign inversion, let's keep it simple: 
                // We will just store normal mathematical values if we don't care, 
                // or we use a convention where Balance always increases with Credit, decreases with Debit.
                // Or vice versa.
                // Actually, let's just make it context-aware or define universally:
                // debit increases asset/expense. credit increases liability/equity/revenue.
                // We stored types in ledger_accounts, let's adjust balance properly.
                const accTypeRow = db.prepare( 'SELECT type FROM ledger_accounts WHERE id = ?' ).get( entry.accountId ) as { type: string };
                let balanceChange = 0;

                if ( accTypeRow.type === 'asset' || accTypeRow.type === 'expense' ) {
                    balanceChange = ( debitVal || 0 ) - ( creditVal || 0 );
                } else {
                    balanceChange = ( creditVal || 0 ) - ( debitVal || 0 );
                }

                db.prepare( 'UPDATE ledger_accounts SET balance = balance + ? WHERE id = ?' ).run( balanceChange, entry.accountId );

                results.push( { id: entryId, accountId: entry.accountId, debit: debitVal, credit: creditVal } );
            }
            return results;
        } );

        const recordedEntries = tx( entries, description );

        return NextResponse.json( { success: true, transactionId, entries: recordedEntries } );
    } catch ( error: any ) {
        console.error( 'Error creating ledger entries:', error );
        return NextResponse.json( { error: error.message || 'Internal server error' }, { status: 500 } );
    }
}
