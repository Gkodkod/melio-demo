'use client';

import { useState } from 'react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import { Invoice } from '@/lib/types';
import InvoiceModals from './invoice-modals';
import { FileText } from 'lucide-react';

interface InvoicesTableProps {
    invoices: Invoice[];
    columns: DataTableColumn<Invoice>[];
}

export default function InvoicesTable( { invoices }: { invoices: Invoice[], columns: DataTableColumn<Invoice>[] } ) {
    const [showUploadModal, setShowUploadModal] = useState( false );
    const [showApprovalModal, setShowApprovalModal] = useState<Invoice | null>( null );
    const [showPdfViewer, setShowPdfViewer] = useState<Invoice | null>( null );

    // We redefine columns here because they need access to the local state for actions
    const tableColumns: DataTableColumn<Invoice>[] = [
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
        // ... other columns will be passed from server or mapped
    ];

    // Actually it's better to pass the setter functions or use a context if we want to keep columns on server.
    // But for a quick win, let's keep the table and its actions in one client component for now, 
    // but the DATA comes from the server.
    
    return null; // I'll refine this.
}
