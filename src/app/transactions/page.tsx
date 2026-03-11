import {
    Activity,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    Clock,
} from 'lucide-react';
import StatusBadge from '@/components/status-badge';
import PageHeader from '@/components/page-header';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { TransactionEventType } from '@/lib/types';
import { Metadata } from 'next';
import { getTransactionEvents } from '@/lib/data';

export const metadata: Metadata = {
    title: 'Transactions | Melio',
    description: 'Track all payment events and transaction history.',
};
import TransactionTypeFilter from '@/components/transactions/transaction-type-filter';

const eventTypeConfig: Record<TransactionEventType, { icon: any; color: string; bg: string; label: string }> = {
    'payment.created': {
        icon: ArrowUpRight,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        label: 'Payment Created',
    },
    'payment.processing': {
        icon: Clock,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        label: 'Payment Processing',
    },
    'payment.settled': {
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        label: 'Payment Settled',
    },
    'payment.failed': {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        label: 'Payment Failed',
    },
};

interface PageProps {
    searchParams: Promise<{ type?: string }>;
}

export default async function TransactionsPage( { searchParams }: PageProps ) {
    const { type: filterType = 'all' } = await searchParams;
    const events = await getTransactionEvents();

    const filtered =
        filterType === 'all'
            ? events
            : events.filter( ( e ) => e.type === filterType );

    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Transactions"
                description="Event log for all payment activity — similar to webhook events"
                action={
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Activity size={16} className="text-indigo-400" />
                        {events.length} events
                    </div>
                }
            />

            <TransactionTypeFilter />

            <div className="space-y-3">
                {filtered.map( ( event ) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;
                    return (
                        <div
                            key={event.id}
                            className="glass-card rounded-2xl p-5 hover:border-slate-600 transition-all duration-200"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}
                                >
                                    <Icon size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                                            {event.type}
                                        </span>
                                        <span className="text-xs text-slate-600">{event.id}</span>
                                    </div>
                                    <p className="text-sm font-medium text-white mb-1">
                                        {config.label} — {event.data.vendorName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {formatDateTime( event.timestamp )} • Payment {event.paymentId}
                                    </p>
                                    {event.data.failureReason && (
                                        <div className="mt-2 p-2.5 rounded-lg bg-red-500/5 ring-1 ring-red-500/20">
                                            <p className="text-xs text-red-400">{event.data.failureReason}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-semibold text-white">
                                        {formatCurrency( event.data.amount )}
                                    </p>
                                    <div className="mt-1">
                                        <StatusBadge status={event.data.status} />
                                    </div>
                                    <p className="text-[10px] text-slate-600 mt-1 uppercase">
                                        {event.data.paymentMethod}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                } )}
            </div>
        </div>
    );
}
