'use client';

import { useState } from 'react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/status-badge';
import { FileText } from 'lucide-react';
import InvoiceModals from './invoice-modals';

interface InvoicesTableProps {
    invoices: Invoice[];
    showUploadModal: boolean;
    setShowUploadModal: ( show: boolean ) => void;
}

export default function InvoicesTable( { invoices, showUploadModal, setShowUploadModal }: InvoicesTableProps ) {
    const [showApprovalModal, setShowApprovalModal] = useState<Invoice | null>( null );
    const [showPdfViewer, setShowPdfViewer] = useState<Invoice | null>( null );

    const columns: DataTableColumn<Invoice>[] = [
        {
            key: 'invoice',
            header: 'Invoice',
            sortValue: ( i ) => i.invoiceNumber,
            render: ( i ) => (
                <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowPdfViewer(i);
                    }}
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                        <FileText size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-white group-hover:text-blue-400 transition-colors">{i.invoiceNumber}</p>
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
            render: ( i ) => (
                <div className="flex items-center gap-3 justify-end">
                    {i.status === 'pending' && (
                        <button
                            onClick={( e ) => {
                                e.stopPropagation();
                                setShowApprovalModal( i );
                            }}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Review
                        </button>
                    )}
                </div>
            )
        },
    ];

    return (
        <>
            <DataTable columns={columns} data={invoices} emptyMessage="No invoices found." />
            
            <InvoiceModals 
                showUploadModal={showUploadModal}
                setShowUploadModal={setShowUploadModal}
                showApprovalModal={showApprovalModal}
                setShowApprovalModal={setShowApprovalModal}
                showPdfViewer={showPdfViewer}
                setShowPdfViewer={setShowPdfViewer}
            />
        </>
    );
}
