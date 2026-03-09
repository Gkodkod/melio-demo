'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Landmark,
    Shield,
} from 'lucide-react';
import StatusBadge from '@/components/status-badge';
import DataTable, { DataTableColumn } from '@/components/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Vendor, Payment, Invoice } from '@/lib/types';

export default function VendorDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data: vendor } = useQuery<Vendor>( {
        queryKey: ['vendor', id],
        queryFn: () => fetch( `/api/vendors/${id}` ).then( ( r ) => r.json() ),
    } );

    const { data: payments = [] } = useQuery<Payment[]>( {
        queryKey: ['payments'],
        queryFn: () => fetch( '/api/payments' ).then( ( r ) => r.json() ),
    } );

    const { data: invoices = [] } = useQuery<Invoice[]>( {
        queryKey: ['invoices'],
        queryFn: () => fetch( '/api/invoices' ).then( ( r ) => r.json() ),
    } );

    const vendorPayments = payments.filter( ( p ) => p.vendorId === id );
    const vendorInvoices = invoices.filter( ( i ) => i.vendorId === id );

    if ( !vendor ) {
        return (
            <div className="py-20 text-center text-slate-500">Loading vendor…</div>
        );
    }

    const paymentColumns: DataTableColumn<Payment>[] = [
        {
            key: 'invoice',
            header: 'Invoice',
            render: ( p ) => <span className="font-medium text-white">{p.invoiceNumber}</span>,
        },
        {
            key: 'amount',
            header: 'Amount',
            render: ( p ) => <span className="font-semibold text-white">{formatCurrency( p.amount )}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: ( p ) => <StatusBadge status={p.status} />,
        },
        {
            key: 'scheduled',
            header: 'Scheduled',
            render: ( p ) => <span className="text-slate-400">{formatDate( p.scheduledDate )}</span>,
        },
    ];

    const invoiceColumns: DataTableColumn<Invoice>[] = [
        {
            key: 'number',
            header: 'Invoice #',
            render: ( i ) => <span className="font-medium text-white">{i.invoiceNumber}</span>,
        },
        {
            key: 'amount',
            header: 'Amount',
            render: ( i ) => <span className="font-semibold text-white">{formatCurrency( i.amount )}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: ( i ) => <StatusBadge status={i.status} />,
        },
        {
            key: 'due',
            header: 'Due Date',
            render: ( i ) => <span className="text-slate-400">{formatDate( i.dueDate )}</span>,
        },
    ];

    return (
        <div className="space-y-8 pt-8 lg:pt-0">
            <button
                onClick={() => router.push( '/vendors' )}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Vendors
            </button>

            {/* Vendor Header */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Building2 size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{vendor.name}</h2>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Mail size={14} /> {vendor.email}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Phone size={14} /> {vendor.phone}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin size={14} /> {vendor.address}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">{formatCurrency( vendor.totalPaid )}</p>
                        <p className="text-xs text-slate-500 mt-1">Total Paid</p>
                    </div>
                </div>
            </div>

            {/* Payment Method Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <CreditCard size={16} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Payment Method</h3>
                    </div>
                    <p className="text-lg font-semibold text-white uppercase">{vendor.paymentMethod}</p>
                    <p className="text-sm text-slate-500 mt-1">•••• {vendor.accountLast4}</p>
                </div>
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <Landmark size={16} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Bank Info</h3>
                    </div>
                    <p className="text-lg font-semibold text-white">
                        {vendor.bankName || 'N/A'}
                    </p>
                    {vendor.routingNumber && (
                        <p className="text-sm text-slate-500 mt-1">Routing: {vendor.routingNumber}</p>
                    )}
                </div>
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <Shield size={16} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Verification</h3>
                    </div>
                    <StatusBadge status={vendor.bankVerificationStatus} />
                    <p className="text-sm text-slate-500 mt-2">Added {formatDate( vendor.createdAt )}</p>
                </div>
            </div>

            {/* Vendor Invoices */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Invoices ({vendorInvoices.length})</h3>
                <DataTable columns={invoiceColumns} data={vendorInvoices} emptyMessage="No invoices for this vendor." />
            </div>

            {/* Vendor Payments */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Payments ({vendorPayments.length})</h3>
                <DataTable columns={paymentColumns} data={vendorPayments} emptyMessage="No payments for this vendor." />
            </div>
        </div>
    );
}
