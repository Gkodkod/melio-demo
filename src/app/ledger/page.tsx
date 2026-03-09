'use client';

import { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, RefreshCw, Wallet, Search, Building, History, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import PageHeader from '@/components/page-header';

interface LedgerAccount {
    id: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    balance: number;
    createdAt: string;
}

interface LedgerEntry {
    id: string;
    transactionId: string;
    accountId: string;
    accountName: string;
    debit: number | null;
    credit: number | null;
    description: string;
    createdAt: string;
}

export default function LedgerDashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [accounts, setAccounts] = useState<LedgerAccount[]>( [] );
    const [entries, setEntries] = useState<LedgerEntry[]>( [] );
    const [isLoading, setIsLoading] = useState( true );
    const [searchTerm, setSearchTerm] = useState( '' );

    const fetchData = async () => {
        setIsLoading( true );
        try {
            const [accRes, entRes] = await Promise.all( [
                fetch( '/api/ledger/accounts' ),
                fetch( '/api/ledger/entries' )
            ] );

            if ( accRes.ok && entRes.ok ) {
                const accData = await accRes.json();
                const entData = await entRes.json();
                setAccounts( accData.accounts || [] );
                setEntries( entData.entries || [] );
            }
        } catch ( error ) {
            console.error( 'Error fetching ledger data:', error );
        } finally {
            setIsLoading( false );
        }
    };

    useEffect( () => {
        fetchData();
    }, [] );

    const formatCurrency = ( amount: number | null | undefined ) => {
        if ( amount === null || amount === undefined ) return '-';
        return new Intl.NumberFormat( 'en-US', { style: 'currency', currency: 'USD' } ).format( amount );
    };

    const getAccountIcon = ( name: string, type: string ) => {
        if ( name.includes( 'buyer' ) ) return <Building size={20} className="text-blue-500" />;
        if ( name.includes( 'vendor' ) ) return <Wallet size={20} className="text-emerald-500" />;
        if ( type === 'equity' ) return <Scale size={20} className="text-purple-500" />;
        return <BookOpen size={20} className="text-slate-500" />;
    };

    const getAccountColor = ( name: string, type: string ) => {
        if ( name.includes( 'buyer' ) ) return isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200';
        if ( name.includes( 'vendor' ) ) return isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200';
        if ( type === 'equity' ) return isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200';
        return isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
    };

    const filteredEntries = entries.filter( e =>
        e.transactionId.toLowerCase().includes( searchTerm.toLowerCase() ) ||
        e.accountName.toLowerCase().includes( searchTerm.toLowerCase() ) ||
        e.description.toLowerCase().includes( searchTerm.toLowerCase() )
    );

    return (
        <div className="flex-1 space-y-6 max-w-[1600px] w-full mx-auto pb-10">
            <PageHeader
                title="Double-Entry Ledger"
                description="Core accounting system with strict double-entry invariants, transaction journal, and immutable audit trail."
                action={
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all",
                            isDark ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        <RefreshCw size={16} className={cn( isLoading && "animate-spin" )} />
                        Refresh Data
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart of Accounts */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className={cn( "text-lg font-semibold flex items-center gap-2", isDark ? "text-slate-100" : "text-slate-900" )}>
                            <BookOpen size={20} className="text-indigo-500" />
                            Chart of Accounts
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4">
                        {accounts.map( account => (
                            <div key={account.id} className={cn(
                                "p-5 rounded-xl border flex items-center justify-between transition-all hover:shadow-md",
                                getAccountColor( account.name, account.type )
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn( "p-3 rounded-lg bg-white/50 backdrop-blur-sm dark:bg-black/20" )}>
                                        {getAccountIcon( account.name, account.type )}
                                    </div>
                                    <div>
                                        <h3 className={cn( "font-medium", isDark ? "text-slate-200" : "text-slate-900" )}>{account.name}</h3>
                                        <p className={cn( "text-xs uppercase tracking-wider font-semibold",
                                            account.type === 'asset' || account.type === 'expense' ? "text-blue-500" : "text-emerald-500"
                                        )}>
                                            {account.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn( "text-xl font-bold font-mono tracking-tight", isDark ? "text-slate-100" : "text-slate-900" )}>
                                        {formatCurrency( account.balance )}
                                    </p>
                                </div>
                            </div>
                        ) )}
                    </div>

                    {/* Insights Card */}
                    <div className={cn( "p-5 rounded-xl border", isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-200" )}>
                        <div className="flex gap-4">
                            <AlertCircle size={24} className="text-indigo-500 shrink-0" />
                            <div>
                                <h4 className={cn( "font-semibold mb-1", isDark ? "text-indigo-300" : "text-indigo-700" )}>Double-Entry Invariant</h4>
                                <p className={cn( "text-sm leading-relaxed", isDark ? "text-indigo-400/80" : "text-indigo-600/80" )}>
                                    The system enforces strict double-entry rules. Every transaction must have equal debits and credits across multiple accounts.
                                    Total assets must always equal total liabilities plus equity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Journal & Audit Trail */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className={cn( "text-lg font-semibold flex items-center gap-2", isDark ? "text-slate-100" : "text-slate-900" )}>
                            <History size={20} className="text-indigo-500" />
                            Transaction Journal
                        </h2>

                        <div className="relative w-64">
                            <Search size={16} className={cn( "absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-slate-500" : "text-slate-400" )} />
                            <input
                                type="text"
                                placeholder="Search entries..."
                                value={searchTerm}
                                onChange={e => setSearchTerm( e.target.value )}
                                className={cn(
                                    "w-full pl-9 pr-4 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all",
                                    isDark ? "bg-slate-900 border-slate-700 text-slate-200 focus:ring-indigo-500" : "bg-white border-slate-300 text-slate-800 focus:ring-indigo-200"
                                )}
                            />
                        </div>
                    </div>

                    <div className={cn( "rounded-xl border overflow-hidden shadow-sm", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200" )}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className={cn( "text-xs uppercase bg-slate-50 dark:bg-slate-900/50 border-b", isDark ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-200" )}>
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Date & Txn ID</th>
                                        <th className="px-6 py-4 font-semibold">Account</th>
                                        <th className="px-6 py-4 font-semibold">Description</th>
                                        <th className="px-6 py-4 font-semibold text-right">Debit</th>
                                        <th className="px-6 py-4 font-semibold text-right">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                                No ledger entries found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEntries.map( ( entry, idx ) => {
                                            // Optional visual grouping for same transaction:
                                            const isNewTxn = idx === 0 || filteredEntries[idx - 1].transactionId !== entry.transactionId;

                                            return (
                                                <tr key={entry.id} className={cn(
                                                    "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                                    isNewTxn ? "" : "bg-slate-50/30 dark:bg-slate-900/10"
                                                )}>
                                                    <td className="px-6 py-3 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className={cn( "font-medium", isDark ? "text-slate-300" : "text-slate-700" )}>
                                                                {new Date( entry.createdAt ).toLocaleDateString()} {new Date( entry.createdAt ).toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit' } )}
                                                            </span>
                                                            <span className="text-xs text-slate-500 font-mono mt-0.5">{entry.transactionId}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider",
                                                            entry.accountName.includes( 'buyer' ) ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" :
                                                                entry.accountName.includes( 'vendor' ) ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                                                    "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                                                        )}>
                                                            {entry.accountName}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <span className={isDark ? "text-slate-300" : "text-slate-600"}>{entry.description}</span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-mono font-medium">
                                                        {entry.debit !== null ? (
                                                            <span className="text-blue-600 dark:text-blue-400">{formatCurrency( entry.debit )}</span>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-700">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-mono font-medium">
                                                        {entry.credit !== null ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency( entry.credit )}</span>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-700">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        } )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
