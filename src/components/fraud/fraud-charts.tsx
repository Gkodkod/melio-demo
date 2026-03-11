'use client';

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
import { TrendingUp, Zap } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { FraudDashboardSummary } from '@/lib/types';

const RULE_COLORS = [
    '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899',
];

interface FraudChartsProps {
    summary: FraudDashboardSummary;
}

export default function FraudCharts( { summary }: FraudChartsProps ) {
    return (
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
    );
}
