'use client';

import { TrendingUp, Activity } from 'lucide-react';
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
import { formatCurrency, formatDate } from '@/lib/utils';
import type { VendorRiskSummary } from '@/lib/types';

export default function VendorRiskCharts({ summary }: { summary: VendorRiskSummary }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk History Chart */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-slate-400" />
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                        Platform Risk History (30 Days)
                    </h3>
                </div>
                {summary.riskHistory && summary.riskHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={summary.riskHistory}>
                            <defs>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                tickFormatter={(v) => formatDate(v).slice(0, 6)}
                            />
                            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                }}
                                labelStyle={{ color: '#94a3b8' }}
                                itemStyle={{ color: '#8b5cf6' }}
                                labelFormatter={(v) => formatDate(v as string)}
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
                {summary.velocityData && summary.velocityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={summary.velocityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                tickFormatter={(val) => val.split(' ')[0]}
                            />
                            <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                }}
                                labelStyle={{ color: '#94a3b8' }}
                                cursor={{ fill: '#1e293b' }}
                                formatter={(value: unknown, name: unknown) => {
                                    if (name === 'Volume') return formatCurrency(Number(value));
                                    return value as string | number;
                                }}
                            />
                            <Bar yAxisId="left" dataKey="volume" name="Volume" radius={[4, 4, 0, 0]}>
                                {summary.velocityData.map((_, idx) => (
                                    <Cell key={idx} fill="#3b82f6" />
                                ))}
                            </Bar>
                            <Bar yAxisId="right" dataKey="count" name="Payment Count" radius={[4, 4, 0, 0]}>
                                {summary.velocityData.map((_, idx) => (
                                    <Cell key={idx} fill="#0ea5e9" />
                                ))}
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
    );
}
