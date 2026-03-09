'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
    ShieldAlert,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Search,
    X,
    ArrowLeft,
    Building2,
    TrendingUp,
    Shield,
    Zap,
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
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { FraudAlert, FraudDashboardSummary, RiskLevel } from '@/lib/types';

// ─── Detail modal types ────────────────────────────────────────────

interface AlertDetail {
    alert: FraudAlert;
    payment: {
        id: string;
        vendorName: string;
        amount: number;
        paymentMethod: string;
        status: string;
        scheduledDate: string;
        processedDate?: string;
        settledDate?: string;
        failureReason?: string;
        createdAt: string;
    };
    vendor: {
        id: string;
        name: string;
        email: string;
        createdAt: string;
        totalPaid: number;
    };
    vendorRiskProfile: {
        paymentCount: number;
        avgAmount: number;
        totalVolume: number;
        vendorAge: number;
    };
    events: {
        id: string;
        type: string;
        timestamp: string;
        data: { status: string; amount: number };
    }[];
}

// ─── Bar chart colors ──────────────────────────────────────────────

const RULE_COLORS = [
    '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899',
];

// ─── Component ─────────────────────────────────────────────────────

export default function FraudMonitorPage() {
    const [search, setSearch] = useState( '' );
    const [riskFilter, setRiskFilter] = useState<string>( 'all' );
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>( null );

    // Summary data
    const { data: summary } = useQuery<FraudDashboardSummary>( {
        queryKey: ['fraud-summary'],
        queryFn: () => fetch( '/api/fraud-monitor' ).then( ( r ) => r.json() ),
    } );

    // All alerts
    const { data: alerts = [], isLoading } = useQuery<FraudAlert[]>( {
        queryKey: ['fraud-alerts'],
        queryFn: () => fetch( '/api/fraud-monitor/alerts' ).then( ( r ) => r.json() ),
    } );

    // Alert detail (fetch when selected)
    const { data: alertDetail } = useQuery<AlertDetail>( {
        queryKey: ['fraud-alert-detail', selectedAlertId],
        queryFn: () => fetch( `/api/fraud-monitor/alerts/${selectedAlertId}` ).then( ( r ) => r.json() ),
        enabled: !!selectedAlertId,
    } );

    // ── Filtered alerts ────────────────────────────────────────────
    const filtered = alerts.filter( ( a ) => {
        const matchesSearch =
            a.paymentId.toLowerCase().includes( search.toLowerCase() ) ||
            a.vendorName.toLowerCase().includes( search.toLowerCase() );
        const matchesRisk = riskFilter === 'all' || a.riskLevel === riskFilter;
        return matchesSearch && matchesRisk;
    } );

    // ── Table columns ──────────────────────────────────────────────
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

    const riskFilters = ['all', 'high', 'medium', 'low'];

    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Fraud Monitor"
                description="Suspicious activity detection and risk scoring"
            />

            {/* ── Summary Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Flagged"
                    value={String( summary?.totalFlagged ?? '—' )}
                    icon={ShieldAlert}
                    gradient="bg-gradient-to-br from-orange-600 to-red-700"
                    iconBg="bg-white/20"
                    trend={summary ? `${summary.totalFlagged} alerts` : undefined}
                />
                <SummaryCard
                    title="High Risk"
                    value={String( summary?.highRiskCount ?? '—' )}
                    icon={AlertTriangle}
                    gradient="bg-gradient-to-br from-red-600 to-rose-800"
                    iconBg="bg-white/20"
                    subtitle="Score ≥ 60"
                />
                <SummaryCard
                    title="Pending Review"
                    value={String( summary?.pendingReview ?? '—' )}
                    icon={Clock}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                    iconBg="bg-white/20"
                    subtitle="Awaiting investigation"
                />
                <SummaryCard
                    title="Cleared Today"
                    value={String( summary?.clearedToday ?? '—' )}
                    icon={CheckCircle2}
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                    iconBg="bg-white/20"
                    subtitle="Resolved as safe"
                />
            </div>

            {/* ── Charts Row ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Trend Chart */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-slate-400" />
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            Risk Trend (30 days)
                        </h3>
                    </div>
                    {summary?.riskTrend && summary.riskTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={summary.riskTrend}>
                                <defs>
                                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickFormatter={( v ) => new Date( v ).toLocaleDateString( 'en', { month: 'short', day: 'numeric' } )}
                                />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                    itemStyle={{ color: '#ef4444' }}
                                    labelFormatter={( v ) => formatDate( v as string )}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    fill="url(#riskGradient)"
                                    name="Flagged"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">
                            No trend data available
                        </div>
                    )}
                </div>

                {/* Rule Statistics Chart */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={16} className="text-slate-400" />
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            Rule Trigger Statistics
                        </h3>
                    </div>
                    {summary?.ruleStats && summary.ruleStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={summary.ruleStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <YAxis
                                    type="category"
                                    dataKey="rule"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    width={140}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                />
                                <Bar dataKey="triggerCount" name="Triggers" radius={[0, 6, 6, 0]}>
                                    {summary.ruleStats.map( ( _, idx ) => (
                                        <Cell key={idx} fill={RULE_COLORS[idx % RULE_COLORS.length]} />
                                    ) )}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-slate-600 text-sm">
                            No rule data available
                        </div>
                    )}
                </div>
            </div>

            {/* ── Filters ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by payment ID or vendor…"
                        value={search}
                        onChange={( e ) => setSearch( e.target.value )}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {riskFilters.map( ( r ) => (
                        <button
                            key={r}
                            onClick={() => setRiskFilter( r )}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${riskFilter === r
                                ? r === 'high'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    : r === 'medium'
                                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                                        : r === 'low'
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
                                }`}
                        >
                            {r}
                        </button>
                    ) )}
                </div>
            </div>

            {/* ── Suspicious Payments Table ───────────────────────────── */}
            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading fraud alerts…</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filtered}
                    onRowClick={( a ) => setSelectedAlertId( a.id )}
                    emptyMessage="No suspicious payments found."
                />
            )}

            {/* ── Alert Detail Modal ─────────────────────────────────── */}
            {selectedAlertId && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedAlertId( null )}
                >
                    <div
                        className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={( e ) => e.stopPropagation()}
                    >
                        {!alertDetail ? (
                            <div className="text-center py-12 text-slate-500">Loading details…</div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${alertDetail.alert.riskLevel === 'high'
                                            ? 'bg-red-500/10 text-red-400'
                                            : alertDetail.alert.riskLevel === 'medium'
                                                ? 'bg-amber-500/10 text-amber-400'
                                                : 'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">{alertDetail.alert.paymentId}</h2>
                                            <p className="text-sm text-slate-400">{alertDetail.alert.vendorName}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedAlertId( null )}
                                        className="text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Risk Score Gauge */}
                                <div className="glass-card rounded-xl p-5 mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                            Risk Assessment
                                        </span>
                                        <span className={`text-2xl font-bold ${alertDetail.alert.riskLevel === 'high'
                                            ? 'text-red-400'
                                            : alertDetail.alert.riskLevel === 'medium'
                                                ? 'text-amber-400'
                                                : 'text-emerald-400'
                                            }`}>
                                            {alertDetail.alert.riskScore}/100
                                        </span>
                                    </div>
                                    <RiskScoreBar
                                        score={alertDetail.alert.riskScore}
                                        level={alertDetail.alert.riskLevel as RiskLevel}
                                        showLabel={false}
                                        className="mb-3"
                                    />
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={alertDetail.alert.riskLevel} />
                                        <StatusBadge status={alertDetail.alert.status} />
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="glass-card rounded-xl p-5 mb-6">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        Payment Details
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            ['Amount', formatCurrency( alertDetail.payment.amount )],
                                            ['Method', alertDetail.payment.paymentMethod.toUpperCase()],
                                            ['Status', alertDetail.payment.status],
                                            ['Scheduled', formatDate( alertDetail.payment.scheduledDate )],
                                            ['Flagged', formatDateTime( alertDetail.alert.flaggedAt )],
                                        ].map( ( [label, value] ) => (
                                            <div key={label} className="flex justify-between text-sm">
                                                <span className="text-slate-400">{label}</span>
                                                <span className="text-white font-medium">{value}</span>
                                            </div>
                                        ) )}
                                    </div>
                                </div>

                                {/* Triggered Rules */}
                                <div className="glass-card rounded-xl p-5 mb-6">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        Triggered Rules
                                    </h3>
                                    <div className="space-y-2">
                                        {alertDetail.alert.triggeredRules.map( ( rule ) => (
                                            <div
                                                key={rule}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 ring-1 ring-slate-700"
                                            >
                                                <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                                                <span className="text-sm text-white font-medium">{rule}</span>
                                            </div>
                                        ) )}
                                    </div>
                                </div>

                                {/* Vendor Risk Profile */}
                                <div className="glass-card rounded-xl p-5 mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Building2 size={14} className="text-slate-400" />
                                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                            Vendor Risk Profile
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            ['Vendor Age', `${alertDetail.vendorRiskProfile.vendorAge} days`],
                                            ['Total Payments', String( alertDetail.vendorRiskProfile.paymentCount )],
                                            ['Avg Amount', formatCurrency( alertDetail.vendorRiskProfile.avgAmount )],
                                            ['Total Volume', formatCurrency( alertDetail.vendorRiskProfile.totalVolume )],
                                        ].map( ( [label, value] ) => (
                                            <div key={label} className="p-3 rounded-lg bg-slate-800/30">
                                                <p className="text-xs text-slate-500 mb-1">{label}</p>
                                                <p className="text-sm font-semibold text-white">{value}</p>
                                            </div>
                                        ) )}
                                    </div>
                                </div>

                                {/* Transaction History */}
                                {alertDetail.events.length > 0 && (
                                    <div className="glass-card rounded-xl p-5">
                                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                            Transaction History
                                        </h3>
                                        <div className="space-y-3">
                                            {alertDetail.events.map( ( evt ) => (
                                                <div key={evt.id} className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-white">{evt.type}</p>
                                                        <p className="text-xs text-slate-500">{formatDateTime( evt.timestamp )}</p>
                                                    </div>
                                                    <StatusBadge status={evt.data.status} />
                                                </div>
                                            ) )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedAlertId( null )}
                                    className="w-full mt-6 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
