'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Upload, Search, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import StatusBadge from '@/components/status-badge';
import PageHeader from '@/components/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice } from '@/lib/types';

export default function InvoicesPage() {
    const [search, setSearch] = useState( '' );
    const [filterStatus, setFilterStatus] = useState<string>( 'all' );
    const [showUploadModal, setShowUploadModal] = useState( false );
    const [showApprovalModal, setShowApprovalModal] = useState<Invoice | null>( null );

    const { data: invoices = [], isLoading } = useQuery<Invoice[]>( {
        queryKey: ['invoices'],
        queryFn: () => fetch( '/api/invoices' ).then( ( r ) => r.json() ),
    } );

    const filtered = invoices.filter( ( inv ) => {
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes( search.toLowerCase() ) ||
            inv.vendorName.toLowerCase().includes( search.toLowerCase() );
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    } );

    const columns: DataTableColumn<Invoice>[] = [
        {
            key: 'invoice',
            header: 'Invoice',
            sortValue: ( i ) => i.invoiceNumber,
            render: ( i ) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400">
                        <FileText size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-white">{i.invoiceNumber}</p>
                        <p className="text-xs text-slate-500">{i.description}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'vendor',
            header: 'Vendor',
            sortValue: ( i ) => i.vendorName,
            render: ( i ) => <span className="text-slate-300">{i.vendorName}</span>,
        },
        {
            key: 'amount',
            header: 'Amount',
            sortValue: ( i ) => i.amount,
            render: ( i ) => (
                <span className="font-semibold text-white">{formatCurrency( i.amount )}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortValue: ( i ) => i.status,
            render: ( i ) => <StatusBadge status={i.status} />,
        },
        {
            key: 'due',
            header: 'Due Date',
            sortValue: ( i ) => i.dueDate,
            render: ( i ) => <span className="text-slate-400">{formatDate( i.dueDate )}</span>,
        },
        {
            key: 'actions',
            header: '',
            render: ( i ) =>
                i.status === 'pending' ? (
                    <button
                        onClick={( e ) => {
                            e.stopPropagation();
                            setShowApprovalModal( i );
                        }}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Review
                    </button>
                ) : i.fileName ? (
                    <span className="text-xs text-slate-500">{i.fileName}</span>
                ) : null,
        },
    ];

    const statuses = ['all', 'pending', 'approved', 'rejected', 'paid'];

    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Invoices"
                description="Track and manage vendor invoices"
                action={
                    <button
                        onClick={() => setShowUploadModal( true )}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Upload size={16} />
                        Upload Invoice
                    </button>
                }
            />

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={search}
                        onChange={( e ) => setSearch( e.target.value )}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                </div>

                {/* Status filter */}
                <div className="flex gap-2">
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
                <div className="text-center py-12 text-slate-500">Loading invoices…</div>
            ) : (
                <DataTable columns={columns} data={filtered} emptyMessage="No invoices found." />
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal( false )}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={( e ) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-2">Upload Invoice</h2>
                        <p className="text-sm text-slate-400 mb-6">Upload a PDF or image of the vendor invoice.</p>
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
                            <Upload size={32} className="mx-auto text-slate-500 mb-3" />
                            <p className="text-sm text-slate-400">Drop file here or click to browse</p>
                            <p className="text-xs text-slate-600 mt-1">PDF, PNG, or JPG up to 10MB</p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowUploadModal( false )}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowUploadModal( false )}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowApprovalModal( null )}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={( e ) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-2">Review Invoice</h2>
                        <p className="text-sm text-slate-400 mb-6">
                            Approve or reject this invoice for payment processing.
                        </p>
                        <div className="glass-card rounded-xl p-4 space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Invoice #</span>
                                <span className="text-white font-medium">{showApprovalModal.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Vendor</span>
                                <span className="text-white">{showApprovalModal.vendorName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Amount</span>
                                <span className="text-white font-semibold">{formatCurrency( showApprovalModal.amount )}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Due Date</span>
                                <span className="text-white">{formatDate( showApprovalModal.dueDate )}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Description</span>
                                <span className="text-white text-right max-w-[200px]">{showApprovalModal.description}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApprovalModal( null )}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors ring-1 ring-red-500/20"
                            >
                                <XCircle size={16} />
                                Reject
                            </button>
                            <button
                                onClick={() => setShowApprovalModal( null )}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors ring-1 ring-emerald-500/20"
                            >
                                <CheckCircle size={16} />
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
