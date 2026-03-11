'use client';

import { useState, useMemo, memo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTableColumn<T> {
    key: string;
    header: string;
    render: ( item: T ) => React.ReactNode;
    /** If provided, this column is sortable. Return the raw value to sort by. */
    sortValue?: ( item: T ) => string | number;
    className?: string;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    onRowClick?: ( item: T ) => void;
    emptyMessage?: string;
}

type SortDir = 'asc' | 'desc';

const DataTableRow = memo( function DataTableRow( {
    item,
    columns,
    onRowClick,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: DataTableColumn<any>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onRowClick?: ( item: any ) => void;
} ) {
    return (
        <tr
            onClick={() => onRowClick?.( item )}
            className={cn(
                'transition-colors duration-150',
                onRowClick
                    ? 'cursor-pointer hover:bg-slate-800/50'
                    : 'hover:bg-slate-800/30'
            )}
        >
            {columns.map( ( col ) => (
                <td
                    key={col.key}
                    className={cn(
                        'whitespace-nowrap px-6 py-4 text-sm text-slate-300',
                        col.className
                    )}
                >
                    {col.render( item )}
                </td>
            ) )}
        </tr>
    );
} );

export default function DataTable<T>( {
    columns,
    data,
    onRowClick,
    emptyMessage = 'No data found.',
}: DataTableProps<T> ) {
    const [sortKey, setSortKey] = useState<string | null>( null );
    const [sortDir, setSortDir] = useState<SortDir>( 'asc' );

    const handleSort = ( col: DataTableColumn<T> ) => {
        if ( !col.sortValue ) return;
        if ( sortKey === col.key ) {
            setSortDir( ( d ) => ( d === 'asc' ? 'desc' : 'asc' ) );
        } else {
            setSortKey( col.key );
            setSortDir( 'asc' );
        }
    };

    const sortedData = useMemo( () => {
        if ( !sortKey ) return data;
        const col = columns.find( ( c ) => c.key === sortKey );
        if ( !col?.sortValue ) return data;
        const accessor = col.sortValue;
        return [...data].sort( ( a, b ) => {
            const va = accessor( a );
            const vb = accessor( b );
            if ( typeof va === 'number' && typeof vb === 'number' ) {
                return sortDir === 'asc' ? va - vb : vb - va;
            }
            const sa = String( va ).toLowerCase();
            const sb = String( vb ).toLowerCase();
            if ( sa < sb ) return sortDir === 'asc' ? -1 : 1;
            if ( sa > sb ) return sortDir === 'asc' ? 1 : -1;
            return 0;
        } );
    }, [data, sortKey, sortDir, columns] );

    if ( data.length === 0 ) {
        return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                <p className="text-slate-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            {columns.map( ( col ) => {
                                const isSortable = !!col.sortValue;
                                const isActive = sortKey === col.key;
                                return (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort( col )}
                                        className={cn(
                                            'px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400',
                                            isSortable && 'cursor-pointer select-none hover:text-slate-200 transition-colors',
                                            isActive && 'text-indigo-400',
                                            col.className
                                        )}
                                    >
                                        <span className="inline-flex items-center gap-1.5">
                                            {col.header}
                                            {isSortable && (
                                                isActive ? (
                                                    sortDir === 'asc' ? (
                                                        <ChevronUp size={14} className="text-indigo-400" />
                                                    ) : (
                                                        <ChevronDown size={14} className="text-indigo-400" />
                                                    )
                                                ) : (
                                                    <ChevronsUpDown size={14} className="opacity-30" />
                                                )
                                            )}
                                        </span>
                                    </th>
                                );
                            } )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {sortedData.map( ( item, idx ) => (
                            <DataTableRow 
                                key={idx} 
                                item={item} 
                                columns={columns} 
                                onRowClick={onRowClick} 
                            />
                        ) )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export type { DataTableColumn };
