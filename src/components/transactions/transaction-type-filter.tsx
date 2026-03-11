'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import { useTransition } from 'react';

const types = [
    'all',
    'payment.created',
    'payment.processing',
    'payment.settled',
    'payment.failed',
];

export default function TransactionTypeFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentFilter = searchParams.get( 'type' ) || 'all';

    const handleFilterChange = ( type: string ) => {
        const params = new URLSearchParams( searchParams.toString() );
        if ( type === 'all' ) {
            params.delete( 'type' );
        } else {
            params.set( 'type', type );
        }

        startTransition( () => {
            router.push( `${pathname}?${params.toString()}` );
        } );
    };

    return (
        <div className={`flex items-center gap-2 flex-wrap ${isPending ? 'opacity-50' : ''}`}>
            <Filter size={14} className="text-slate-500" />
            {types.map( ( t ) => (
                <button
                    key={t}
                    onClick={() => handleFilterChange( t )}
                    disabled={isPending}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${currentFilter === t
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
                        }`}
                >
                    {t === 'all' ? 'All Events' : t}
                </button>
            ) )}
        </div>
    );
}
