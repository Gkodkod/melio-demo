'use client';

import { useState } from 'react';
import { Search, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LedgerEntry } from '@/lib/db';

const formatCurrency = ( amount: number | null | undefined ) => {
    if ( amount === null || amount === undefined ) return '-';
    return new Intl.NumberFormat( 'en-US', { style: 'currency', currency: 'USD' } ).format( amount );
};

export default function TransactionJournal({ entries, isDark }: { entries: LedgerEntry[], isDark: boolean }) {
    const [searchTerm, setSearchTerm] = useState( '' );

    const filteredEntries = entries.filter( e =>
        (e.transactionId || '').toLowerCase().includes( searchTerm.toLowerCase() ) ||
        (e.accountName || '').toLowerCase().includes( searchTerm.toLowerCase() ) ||
        (e.description || '').toLowerCase().includes( searchTerm.toLowerCase() )
    );

    return (
        <div className="space-y-4 flex flex-col h-full max-h-[calc(100vh-160px)]">
            <div className="flex items-center justify-between shrink-0">
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

            <div className={cn( "rounded-xl border flex-1 overflow-hidden shadow-sm flex flex-col", isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200" )}>
                <div className="overflow-x-auto flex-1 h-full">
                    <table className="w-full text-sm text-left">
                        <thead className={cn( "text-xs uppercase sticky top-0 bg-slate-50 dark:bg-slate-900/50 border-b z-10", isDark ? "text-slate-400 border-slate-800" : "text-slate-500 border-slate-200" )}>
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
                                                    "px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider whitespace-nowrap",
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
    );
}
