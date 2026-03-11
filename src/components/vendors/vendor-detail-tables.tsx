'use client';

import DataTable, { DataTableColumn } from '@/components/data-table';
import StatusBadge from '@/components/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Payment, Invoice } from '@/lib/types';

export function VendorPaymentsTable( { payments }: { payments: Payment[] } ) {
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

    return (
        <DataTable columns={paymentColumns} data={payments} emptyMessage="No payments for this vendor." />
    );
}

export function VendorInvoicesTable( { invoices }: { invoices: Invoice[] } ) {
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
        <DataTable columns={invoiceColumns} data={invoices} emptyMessage="No invoices for this vendor." />
    );
}
