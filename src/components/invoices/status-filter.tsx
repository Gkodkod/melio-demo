'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const statuses = ['all', 'pending', 'approved', 'rejected', 'paid'];

export default function StatusFilter() {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentStatus = searchParams.get( 'status' ) || 'all';

    function handleFilter( status: string ) {
        const params = new URLSearchParams( searchParams );
        if ( status && status !== 'all' ) {
            params.set( 'status', status );
        } else {
            params.delete( 'status' );
        }
        startTransition( () => {
            replace( `${pathname}?${params.toString()}` );
        } );
    }

    return (
        <div className="flex gap-2 flex-wrap">
            {statuses.map( ( s ) => (
                <button
                    key={s}
                    disabled={isPending}
                    onClick={() => handleFilter( s )}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${currentStatus === s
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
                        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {s}
                </button>
            ) )}
        </div>
    );
}
