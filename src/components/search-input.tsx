'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function SearchInput( { placeholder = 'Search...' }: { placeholder?: string } ) {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    function handleSearch( term: string ) {
        const params = new URLSearchParams( searchParams );
        if ( term ) {
            params.set( 'q', term );
        } else {
            params.delete( 'q' );
        }
        startTransition( () => {
            replace( `${pathname}?${params.toString()}` );
        } );
    }

    return (
        <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
                type="text"
                placeholder={placeholder}
                defaultValue={searchParams.get( 'q' )?.toString()}
                onChange={( e ) => handleSearch( e.target.value )}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
