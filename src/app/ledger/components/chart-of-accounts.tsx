import { BookOpen, Scale, Wallet, Building, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LedgerAccount } from '@/lib/db';

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

const getAccountColor = ( name: string, type: string, isDark: boolean ) => {
    if ( name.includes( 'buyer' ) ) return isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200';
    if ( name.includes( 'vendor' ) ) return isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200';
    if ( type === 'equity' ) return isDark ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200';
    return isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
};

export default function ChartOfAccounts({ accounts, isDark }: { accounts: LedgerAccount[], isDark: boolean }) {
    return (
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
                        getAccountColor( account.name, account.type, isDark )
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={cn( "p-3 rounded-lg flex-shrink-0 bg-white/50 backdrop-blur-sm dark:bg-black/20" )}>
                                {getAccountIcon( account.name, account.type )}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className={cn( "font-medium truncate", isDark ? "text-slate-200" : "text-slate-900" )} title={account.name}>
                                    {account.name}
                                </h3>
                                <p className={cn( "text-xs uppercase tracking-wider font-semibold",
                                    account.type === 'asset' || account.type === 'expense' ? "text-blue-500" : "text-emerald-500"
                                )}>
                                    {account.type}
                                </p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                            <p className={cn( "text-base font-bold font-mono tracking-tight", isDark ? "text-slate-100" : "text-slate-900" )}>
                                {formatCurrency( account.balance )}
                            </p>
                        </div>
                    </div>
                ) )}
            </div>

            {/* Insights Card */}
            <div className={cn( "p-5 rounded-xl border mt-6", isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-200" )}>
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
    );
}
