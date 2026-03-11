'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DataTable, { DataTableColumn } from '@/components/data-table';
import { ShieldAlert } from 'lucide-react';
import StatusBadge from '@/components/status-badge';
import RiskScoreBar from '@/components/risk-score-bar';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { FraudAlert, RiskLevel } from '@/lib/types';

interface FraudAlertsTableProps {
    alerts: FraudAlert[];
}

export default function FraudAlertsTable( { alerts }: FraudAlertsTableProps ) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const columns: DataTableColumn<FraudAlert>[] = [
        {
            key: 'payment',
            header: 'Payment',
            sortValue: ( a ) => a.paymentId,
            render: ( a ) => (
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.riskLevel === 'high'
                        ? 'bg-red-500/10 text-red-400'
                        : a.riskLevel === 'medium'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                        <ShieldAlert size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-white">{a.paymentId}</p>
                        <p className="text-xs text-slate-500">{a.vendorName}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
            sortValue: ( a ) => a.amount,
            render: ( a ) => (
                <span className="font-semibold text-white">{formatCurrency( a.amount )}</span>
            ),
        },
        {
            key: 'riskScore',
            header: 'Risk Score',
            sortValue: ( a ) => a.riskScore,
            render: ( a ) => (
                <div className="w-32">
                    <RiskScoreBar score={a.riskScore} level={a.riskLevel as RiskLevel} />
                </div>
            ),
        },
        {
            key: 'rules',
            header: 'Triggered Rules',
            render: ( a ) => (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {a.triggeredRules.slice( 0, 2 ).map( ( rule ) => (
                        <span
                            key={rule}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 ring-1 ring-slate-700"
                        >
                            {rule}
                        </span>
                    ) )}
                    {a.triggeredRules.length > 2 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-500">
                            +{a.triggeredRules.length - 2}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortValue: ( a ) => a.status,
            render: ( a ) => <StatusBadge status={a.status} />,
        },
        {
            key: 'flaggedAt',
            header: 'Flagged',
            sortValue: ( a ) => a.flaggedAt,
            render: ( a ) => (
                <span className="text-slate-400 text-xs">{formatDate( a.flaggedAt )}</span>
            ),
        },
    ];

    const handleRowClick = ( a: FraudAlert ) => {
        const params = new URLSearchParams( searchParams.toString() );
        params.set( 'alertId', a.id );
        router.push( `${pathname}?${params.toString()}`, { scroll: false } );
    };

    return (
        <DataTable
            columns={columns}
            data={alerts}
            onRowClick={handleRowClick}
            emptyMessage="No suspicious payments found."
        />
    );
}
