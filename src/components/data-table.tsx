import { cn } from '@/lib/utils';

interface DataTableColumn<T> {
    key: string;
    header: string;
    render: ( item: T ) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    onRowClick?: ( item: T ) => void;
    emptyMessage?: string;
}

export default function DataTable<T>( {
    columns,
    data,
    onRowClick,
    emptyMessage = 'No data found.',
}: DataTableProps<T> ) {
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
                            {columns.map( ( col ) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        'px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400',
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ) )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {data.map( ( item, idx ) => (
                            <tr
                                key={idx}
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
                        ) )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export type { DataTableColumn };
