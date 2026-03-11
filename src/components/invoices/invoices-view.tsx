'use client';

import { useState } from 'react';
import InvoicesTable from './invoices-table';
import UploadInvoiceButton from './upload-button';
import PageHeader from '@/components/page-header';
import { Invoice } from '@/lib/types';

export default function InvoicesView( { invoices }: { invoices: Invoice[] } ) {
    const [showUploadModal, setShowUploadModal] = useState( false );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Invoices"
                description="Track and manage vendor invoices"
                action={<UploadInvoiceButton onClick={() => setShowUploadModal( true )} />}
            />

            <InvoicesTable 
                invoices={invoices} 
                showUploadModal={showUploadModal}
                setShowUploadModal={setShowUploadModal}
            />
        </div>
    );
}
