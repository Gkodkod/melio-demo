'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTransition } from 'react';

const riskFilters = ['all', 'high', 'medium', 'low'];

export default function FraudFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentSearch = searchParams.get( 'q' ) || '';
    const currentRisk = searchParams.get( 'risk' ) || 'all';

    const updateParams = ( key: string, value: string ) => {
        const params = new URLSearchParams( searchParams.toString() );
        if ( value === 'all' || value === '' ) {
            params.delete( key );
        } else {
            params.set( key, value );
        }

        startTransition( () => {
            router.push( `${pathname}?${params.toString()}` );
        } );
    };

    return (
        <div className={`flex flex-col sm:flex-row gap-4 ${isPending ? 'opacity-50' : ''}`}>
            <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search by payment ID or vendor…"
                    defaultValue={currentSearch}
                    onChange={( e ) => updateParams( 'q', e.target.value )}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
            </div>
            <div className="flex gap-2 flex-wrap">
                {riskFilters.map( ( r ) => (
                    <button
                        key={r}
                        onClick={() => updateParams( 'risk', r )}
                        disabled={isPending}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${currentRisk === r
                            ? r === 'high'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                                : r === 'medium'
                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                                    : r === 'low'
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
                            }`}
                    >
                        {r}
                    </button>
                ) )}
            </div>
        </div>
    );
}
