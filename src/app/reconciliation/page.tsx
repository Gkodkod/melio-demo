'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import PageHeader from '@/components/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ReconciliationRecord } from '@/lib/types';

export default function ReconciliationPage() {
    const { data: records = [] } = useQuery<ReconciliationRecord[]>( {
        queryKey: ['reconciliation'],
        queryFn: () => fetch( '/api/reconciliation' ).then( ( r ) => r.json() ),
    } );

    // Group by batch
    const batches = records.reduce( ( acc, rec ) => {
        if ( !acc[rec.batchId] ) acc[rec.batchId] = [];
        acc[rec.batchId].push( rec );
        return acc;
    }, {} as Record<string, ReconciliationRecord[]> );

    const matchedCount = records.filter( ( r ) => r.matched ).length;
    const mismatchCount = records.filter( ( r ) => !r.matched ).length;
    const totalInvoiceAmount = records.reduce( ( s, r ) => s + r.invoiceAmount, 0 );
    const totalPaymentAmount = records.reduce( ( s, r ) => s + r.paymentAmount, 0 );

    const columns: DataTableColumn<ReconciliationRecord>[] = [
        {
            key: 'invoice',
            header: 'Invoice',
            render: ( r ) => (
                <span className="font-mono text-xs text-white">{r.invoiceNumber}</span>
            ),
        },
        {
            key: 'vendor',
            header: 'Vendor',
            className: 'max-w-[150px]',
            render: ( r ) => <span className="text-slate-300 text-xs truncate max-w-[150px] inline-block" title={r.vendorName}>{r.vendorName}</span>,
        },
        {
            key: 'invoiceAmt',
            header: 'Invoice Amount',
            render: ( r ) => (
                <span className="font-semibold text-xs text-white">{formatCurrency( r.invoiceAmount )}</span>
            ),
        },
        {
            key: 'paymentAmt',
            header: 'Payment Amount',
            render: ( r ) => (
                <span className="font-semibold text-xs text-white">{formatCurrency( r.paymentAmount )}</span>
            ),
        },
        {
            key: 'diff',
            header: 'Difference',
            render: ( r ) => (
                <span
                    className={cn(
                        'font-semibold text-xs',
                        r.difference === 0 ? 'text-slate-500' : 'text-red-400'
                    )}
                >
                    {r.difference === 0 ? '—' : formatCurrency( r.difference )}
                </span>
            ),
        },
        {
            key: 'match',
            header: 'Status',
            render: ( r ) =>
                r.matched ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 size={14} />
                        Matched
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">
                        <AlertTriangle size={14} />
                        Mismatch
                    </span>
                ),
        },
        {
            key: 'settled',
            header: 'Settled',
            render: ( r ) => <span className="text-slate-400 text-xs">{formatDate( r.settledDate )}</span>,
        },
    ];

    return (
        <div className="space-y-8 pt-8 lg:pt-0">
            <PageHeader
                title="Reconciliation"
                description="Match invoice amounts against settled payments"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="glass-card rounded-2xl p-5">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Total Records</p>
                    <p className="text-2xl font-bold text-white">{records.length}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Matched</p>
                    <p className="text-2xl font-bold text-emerald-400">{matchedCount}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Mismatches</p>
                    <p className="text-2xl font-bold text-red-400">{mismatchCount}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Net Difference</p>
                    <p className={cn( 'text-2xl font-bold', totalInvoiceAmount - totalPaymentAmount === 0 ? 'text-emerald-400' : 'text-red-400' )}>
                        {formatCurrency( Math.abs( totalInvoiceAmount - totalPaymentAmount ) )}
                    </p>
                </div>
            </div>

            {/* Batch Groups */}
            <div className="space-y-6">
                {Object.entries( batches ).map( ( [batchId, batchRecords] ) => {
                    const batchTotal = batchRecords.reduce( ( s, r ) => s + r.paymentAmount, 0 );
                    const hasMismatch = batchRecords.some( ( r ) => !r.matched );
                    return (
                        <div key={batchId}>
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center',
                                        hasMismatch ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                    )}
                                >
                                    {hasMismatch ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{batchId}</h3>
                                    <p className="text-xs text-slate-500">
                                        {batchRecords.length} record{batchRecords.length !== 1 ? 's' : ''} • {formatCurrency( batchTotal )}
                                    </p>
                                </div>
                            </div>
                            <DataTable
                                columns={columns}
                                data={batchRecords}
                                emptyMessage="No records in this batch."
                            />
                        </div>
                    );
                } )}
            </div>
        </div>
    );
}
