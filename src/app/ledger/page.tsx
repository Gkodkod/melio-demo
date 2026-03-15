import { cookies } from 'next/headers';
import PageHeader from '@/components/page-header';
import { getLedgerAccounts, getLedgerEntries } from '@/lib/data';
import ChartOfAccounts from './components/chart-of-accounts';
import TransactionJournal from './components/transaction-journal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LedgerDashboard() {
    // Resolve cookies to get theme
    const cookieStore = await cookies();
    const isDark = cookieStore.get('theme')?.value === 'dark';

    // Fetch data in parallel
    const [accounts, entries] = await Promise.all([
        getLedgerAccounts(),
        getLedgerEntries()
    ]);

    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Double-Entry Ledger"
                description="Core accounting system with strict double-entry invariants, transaction journal, and immutable audit trail."
            />

            <div className="space-y-6">
                <ChartOfAccounts accounts={accounts} isDark={isDark} />
                <TransactionJournal entries={entries} isDark={isDark} />
            </div>
        </div>
    );
}
