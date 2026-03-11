'use client';

import { Building2 } from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import StatusBadge from '@/components/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Vendor } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function VendorsTable( { vendors }: { vendors: Vendor[] } ) {
    const router = useRouter();

    const columns: DataTableColumn<Vendor>[] = [
        {
            key: 'name',
            header: 'Vendor',
            sortValue: ( v ) => v.name,
            render: ( v ) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400">
                        <Building2 size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-white">{v.name}</p>
                        <p className="text-xs text-slate-500">{v.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'method',
            header: 'Payment Method',
            sortValue: ( v ) => v.paymentMethod,
            render: ( v ) => (
                <span className="uppercase text-xs font-semibold tracking-wider text-slate-300">
                    {v.paymentMethod} •••• {v.accountLast4}
                </span>
            ),
        },
        {
            key: 'bank',
            header: 'Bank Status',
            render: ( v ) => <StatusBadge status={v.bankVerificationStatus} />,
        },
        {
            key: 'totalPaid',
            header: 'Total Paid',
            sortValue: ( v ) => v.totalPaid,
            render: ( v ) => (
                <span className="font-semibold text-white">{formatCurrency( v.totalPaid )}</span>
            ),
        },
        {
            key: 'created',
            header: 'Added',
            sortValue: ( v ) => v.createdAt,
            render: ( v ) => <span className="text-slate-400">{formatDate( v.createdAt )}</span>,
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={vendors}
            onRowClick={( v ) => router.push( `/vendors/${v.id}` )}
            emptyMessage="No vendors found."
        />
    );
}
