'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
    ShieldAlert,
    Target,
    Activity,
    AlertTriangle,
    Search,
    TrendingUp,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from 'recharts';
import DataTable, { DataTableColumn } from '@/components/data-table';
import SummaryCard from '@/components/summary-card';
import PageHeader from '@/components/page-header';
import StatusBadge from '@/components/status-badge';
import RiskScoreBar from '@/components/risk-score-bar';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

interface VendorRiskData {
    id: string;
    name: string;
    totalVolume: number;
    paymentCount: number;
    metrics: {
        paymentFailures: number;
        highValueCount: number;
        fraudAlerts: number;
    };
    score: number;
    riskLevel: RiskLevel;
    anomalies: string[];
    vendorAge: string;
}

interface VendorRiskSummary {
    vendors: VendorRiskData[];
    riskHistory: { date: string; avgScore: number }[];
    velocityData: { name: string; volume: number; count: number }[];
}


export default function VendorRiskPage() {
    const [search, setSearch] = useState( '' );

    const { data, isLoading } = useQuery<VendorRiskSummary>( {
        queryKey: ['vendor-risk'],
        queryFn: () => fetch( '/api/fraud-monitor/vendor-risk' ).then( ( r ) => r.json() ),
    } );

    const vendors = data?.vendors || [];
    const filteredVendors = vendors.filter( ( v ) =>
        v.name.toLowerCase().includes( search.toLowerCase() )
    );

    const highRiskCount = vendors.filter( ( v ) => v.riskLevel === 'high' ).length;
    const avgScore = vendors.length
        ? ( vendors.reduce( ( acc, v ) => acc + v.score, 0 ) / vendors.length ).toFixed( 1 )
        : '—';
    const totalAnomalies = vendors.reduce( ( acc, v ) => acc + v.anomalies.length, 0 );

    const columns: DataTableColumn<VendorRiskData>[] = [
        {
            key: 'vendor',
            header: 'Vendor Name',
            sortValue: ( v ) => v.name,
            render: ( v ) => (
                <div className="flex items-center gap-3">
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${v.riskLevel === 'high'
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
            sortValue: ( v ) => v.score,
            render: ( v ) => (
                <div className="w-32">
                    <RiskScoreBar score={v.score} level={v.riskLevel} />
                </div>
            ),
        },
        {
            key: 'metrics',
            header: 'Risk Factors',
            render: ( v ) => (
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
            render: ( v ) => (
                <div className="flex flex-wrap gap-1 max-w-[220px]">
                    {v.anomalies.length > 0 ? (
                        v.anomalies.map( ( anomaly, idx ) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                            >
                                {anomaly}
                            </span>
                        ) )
                    ) : (
                        <span className="text-slate-500 text-xs italic">None detected</span>
                    )}
                </div>
            ),
        },
        {
            key: 'level',
            header: 'Level',
            sortValue: ( v ) => v.riskLevel,
            render: ( v ) => <StatusBadge status={v.riskLevel} />,
        },
    ];

    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Vendor Risk Dashboard"
                description="Monitor vendor-level risk scores, payment velocity, and anomalies"
            />

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SummaryCard
                    title="Average Risk Score"
                    value={String( avgScore )}
                    icon={Activity}
                    gradient="bg-gradient-to-br from-indigo-500 to-cyan-600"
                    iconBg="bg-white/20"
                />
                <SummaryCard
                    title="High Risk Vendors"
                    value={String( highRiskCount )}
                    icon={ShieldAlert}
                    gradient="bg-gradient-to-br from-red-600 to-rose-800"
                    iconBg="bg-white/20"
                    subtitle="Score ≥ 20"
                />
                <SummaryCard
                    title="Active Anomalies"
                    value={String( totalAnomalies )}
                    icon={AlertTriangle}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                    iconBg="bg-white/20"
                    subtitle="Detected behavioral flags"
                />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk History Chart */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-slate-400" />
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            Platform Risk History (30 Days)
                        </h3>
                    </div>
                    {data?.riskHistory && data.riskHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={data.riskHistory}>
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickFormatter={( v ) => formatDate( v ).slice( 0, 6 )}
                                />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                    }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    itemStyle={{ color: '#8b5cf6' }}
                                    labelFormatter={( v ) => formatDate( v as string )}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="avgScore"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fill="url(#scoreGradient)"
                                    name="Avg Platform Risk Score"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[260px] flex items-center justify-center text-slate-600 text-sm">
                            Loading trend...
                        </div>
                    )}
                </div>

                {/* Velocity Chart */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={16} className="text-slate-400" />
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            Payment Velocity (Top Risky Vendors)
                        </h3>
                    </div>
                    {data?.velocityData && data.velocityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.velocityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickFormatter={( val ) => val.split( ' ' )[0]}
                                />
                                <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={( val ) => `${val / 1000}k`} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                    }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    cursor={{ fill: '#1e293b' }}
                                    formatter={( value: unknown, name: unknown ) => {
                                        if ( name === 'Volume' ) return formatCurrency( Number( value ) );
                                        return value as string | number;
                                    }}
                                />
                                <Bar yAxisId="left" dataKey="volume" name="Volume" radius={[4, 4, 0, 0]}>
                                    {data.velocityData.map( ( _, idx ) => (
                                        <Cell key={idx} fill="#3b82f6" />
                                    ) )}
                                </Bar>
                                <Bar yAxisId="right" dataKey="count" name="Payment Count" radius={[4, 4, 0, 0]}>
                                    {data.velocityData.map( ( _, idx ) => (
                                        <Cell key={idx} fill="#0ea5e9" />
                                    ) )}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[260px] flex items-center justify-center text-slate-600 text-sm">
                            Loading velocity data...
                        </div>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
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
                            onChange={( e ) => setSearch( e.target.value )}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-slate-500">
                        Loading vendor risk models...
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredVendors}
                        emptyMessage="No vendors match the current criteria."
                    />
                )}
            </div>
        </div>
    );
}
