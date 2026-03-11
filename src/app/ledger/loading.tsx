import PageHeader from '@/components/page-header';

export default function LedgerLoading() {
    return (
        <div className="flex-1 space-y-6 max-w-[1600px] w-full mx-auto pb-10">
            <PageHeader
                title="Double-Entry Ledger"
                description="Core accounting system with strict double-entry invariants, transaction journal, and immutable audit trail."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart of Accounts Skeleton */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    
                    <div className="flex flex-col gap-4 mt-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
                        ))}
                    </div>

                    <div className="h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-200 dark:border-indigo-500/20 animate-pulse mt-6" />
                </div>

                {/* Journal Skeleton */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    </div>

                    <div className="h-[600px] w-full bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
