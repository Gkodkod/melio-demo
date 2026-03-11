'use client';

import { useState } from 'react';
import { Target, Search } from 'lucide-react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import StatusBadge from '@/components/status-badge';
import RiskScoreBar from '@/components/risk-score-bar';
import type { VendorRiskData } from '@/lib/types';

export default function VendorRiskTable({ vendors }: { vendors: VendorRiskData[] }) {
    const [search, setSearch] = useState('');

    const filteredVendors = vendors.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase())
    );

    const columns: DataTableColumn<VendorRiskData>[] = [
        {
            key: 'vendor',
            header: 'Vendor Name',
            sortValue: (v) => v.name,
            render: (v) => (
                <div className="flex items-center gap-3">
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            v.riskLevel === 'high'
                                ? 'bg-red-500/10 text-red-400'
                                : v.riskLevel === 'medium'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                    >
                        <Target size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-white">{v.name}</p>
                        <p className="text-xs text-slate-500">{v.paymentCount} payments</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'score',
            header: 'Risk Score',
            sortValue: (v) => v.score,
            render: (v) => (
                <div className="w-32">
                    <RiskScoreBar score={v.score} level={v.riskLevel} />
                </div>
            ),
        },
        {
            key: 'metrics',
            header: 'Risk Factors',
            render: (v) => (
                <div className="flex flex-col gap-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                        <span>Failures:</span>
                        <span className="text-white font-medium">{v.metrics.paymentFailures}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fraud Alerts:</span>
                        <span className="text-white font-medium">{v.metrics.fraudAlerts}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>High Value (&gt;$10k):</span>
                        <span className="text-white font-medium">{v.metrics.highValueCount}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'anomalies',
            header: 'Anomaly Detection',
            render: (v) => (
                <div className="flex flex-wrap gap-1 max-w-[220px]">
                    {v.anomalies.length > 0 ? (
                        v.anomalies.map((anomaly, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                            >
                                {anomaly}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-500 text-xs italic">None detected</span>
                    )}
                </div>
            ),
        },
        {
            key: 'level',
            header: 'Level',
            sortValue: (v) => v.riskLevel,
            render: (v) => <StatusBadge status={v.riskLevel} />,
        },
    ];

    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredVendors}
                emptyMessage="No vendors match the current criteria."
            />
        </div>
    );
}
