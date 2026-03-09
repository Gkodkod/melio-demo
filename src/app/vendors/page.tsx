'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import StatusBadge from '@/components/status-badge';
import PageHeader from '@/components/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Vendor } from '@/lib/types';

export default function VendorsPage() {
    const router = useRouter();
    const [search, setSearch] = useState( '' );

    const { data: vendors = [], isLoading } = useQuery<Vendor[]>( {
        queryKey: ['vendors'],
        queryFn: () => fetch( '/api/vendors' ).then( ( r ) => r.json() ),
    } );

    const filtered = vendors.filter( ( v ) =>
        v.name.toLowerCase().includes( search.toLowerCase() )
    );

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
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Vendors"
                description="Manage your vendor relationships and payment methods"
                action={
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                        <Plus size={16} />
                        Add Vendor
                    </button>
                }
            />

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search vendors..."
                    value={search}
                    onChange={( e ) => setSearch( e.target.value )}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading vendors…</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filtered}
                    onRowClick={( v ) => router.push( `/vendors/${v.id}` )}
                    emptyMessage="No vendors found."
                />
            )}
        </div>
    );
}
