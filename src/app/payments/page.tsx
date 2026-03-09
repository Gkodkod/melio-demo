'use client';

import { useQuery } from '@tanstack/react-query';
import {
    CreditCard,
    Plus,
    Search,
    Calendar,
} from 'lucide-react';
import { useState } from 'react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import StatusBadge from '@/components/status-badge';
import PageHeader from '@/components/page-header';
import PaymentTimeline from '@/components/payment-timeline';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment, Vendor, Invoice } from '@/lib/types';


export default function PaymentsPage() {
    const [search, setSearch] = useState( '' );
    const [filterStatus, setFilterStatus] = useState<string>( 'all' );
    const [showCreateModal, setShowCreateModal] = useState( false );
    const [showDetailModal, setShowDetailModal] = useState<Payment | null>( null );

    const { data: payments = [], isLoading } = useQuery<Payment[]>( {
        queryKey: ['payments'],
        queryFn: () => fetch( '/api/payments' ).then( ( r ) => r.json() ),
    } );

    const { data: vendors = [] } = useQuery<Vendor[]>( {
        queryKey: ['vendors'],
        queryFn: () => fetch( '/api/vendors' ).then( ( r ) => r.json() ),
    } );

    const { data: invoices = [] } = useQuery<Invoice[]>( {
        queryKey: ['invoices'],
        queryFn: () => fetch( '/api/invoices' ).then( ( r ) => r.json() ),
    } );

    const filtered = payments.filter( ( p ) => {
        const matchesSearch =
            p.vendorName.toLowerCase().includes( search.toLowerCase() ) ||
            p.invoiceNumber.toLowerCase().includes( search.toLowerCase() );
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    } );

    const columns: DataTableColumn<Payment>[] = [
        {
            key: 'payment',
            header: 'Payment',
            sortValue: ( p ) => p.vendorName,
            render: ( p ) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-violet-400">
                        <CreditCard size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-white">{p.id}</p>
                        <p className="text-xs text-slate-500">{p.vendorName}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'invoice',
            header: 'Invoice',
            render: ( p ) => <span className="text-slate-300 font-mono text-xs">{p.invoiceNumber}</span>,
        },
        {
            key: 'amount',
            header: 'Amount',
            sortValue: ( p ) => p.amount,
            render: ( p ) => (
                <span className="font-semibold text-white">{formatCurrency( p.amount )}</span>
            ),
        },
        {
            key: 'method',
            header: 'Method',
            sortValue: ( p ) => p.paymentMethod,
            render: ( p ) => (
                <span className="uppercase text-xs font-semibold tracking-wider text-slate-400">
                    {p.paymentMethod}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortValue: ( p ) => p.status,
            render: ( p ) => <StatusBadge status={p.status} />,
        },
        {
            key: 'scheduled',
            header: 'Scheduled',
            sortValue: ( p ) => p.scheduledDate,
            render: ( p ) => <span className="text-slate-400">{formatDate( p.scheduledDate )}</span>,
        },
    ];

    const statuses = ['all', 'draft', 'scheduled', 'processing', 'settled', 'failed'];


    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Payments"
                description="Create and manage vendor payments"
                action={
                    <button
                        onClick={() => setShowCreateModal( true )}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={16} />
                        Create Payment
                    </button>
                }
            />

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search payments..."
                        value={search}
                        onChange={( e ) => setSearch( e.target.value )}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {statuses.map( ( s ) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus( s )}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filterStatus === s
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
                                }`}
                        >
                            {s}
                        </button>
                    ) )}
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading payments…</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filtered}
                    onRowClick={( p ) => setShowDetailModal( p )}
                    emptyMessage="No payments found."
                />
            )}

            {/* Create Payment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal( false )}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={( e ) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-2">Create Payment</h2>
                        <p className="text-sm text-slate-400 mb-6">Set up a new vendor payment</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Vendor</label>
                                <select className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                    <option value="">Choose a vendor...</option>
                                    {vendors.map( ( v ) => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ) )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Invoice</label>
                                <select className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                                    <option value="">Choose an invoice...</option>
                                    {invoices.filter( ( i ) => i.status === 'approved' ).map( ( i ) => (
                                        <option key={i.id} value={i.id}>{i.invoiceNumber} — {formatCurrency( i.amount )}</option>
                                    ) )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Method</label>
                                <div className="flex gap-3">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/30 text-sm font-semibold">
                                        <CreditCard size={16} /> ACH
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 text-slate-400 ring-1 ring-slate-700 text-sm font-semibold hover:ring-indigo-500/30 transition-all">
                                        <CreditCard size={16} /> Card
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Schedule Date</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal( false )}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowCreateModal( false )}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                Create Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Detail Modal with Lifecycle */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal( null )}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={( e ) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-1">{showDetailModal.id}</h2>
                        <p className="text-sm text-slate-400 mb-6">{showDetailModal.vendorName}</p>

                        {/* Payment Timeline */}
                        <div className="mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <PaymentTimeline payment={showDetailModal} />
                        </div>

                        <div className="glass-card rounded-xl p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Amount</span>
                                <span className="text-white font-semibold">{formatCurrency( showDetailModal.amount )}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Method</span>
                                <span className="text-white uppercase">{showDetailModal.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Invoice</span>
                                <span className="text-white font-mono text-xs">{showDetailModal.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Scheduled</span>
                                <span className="text-white">{formatDate( showDetailModal.scheduledDate )}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Status</span>
                                <StatusBadge status={showDetailModal.status} />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowDetailModal( null )}
                            className="w-full mt-6 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
