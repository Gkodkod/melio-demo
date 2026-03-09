'use client';
import { ApiUsageMetric } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface MetricsChartProps {
    data: ApiUsageMetric[];
}

export default function MetricsChart( { data }: MetricsChartProps ) {
    // Generate 30 days of empty data to pad the chart
    const now = new Date();
    const paddedData: ApiUsageMetric[] = [];
    for ( let i = 29; i >= 0; i-- ) {
        const d = new Date( now );
        d.setDate( d.getDate() - i );
        const dateStr = d.toISOString().split( 'T' )[0];

        const existing = data.find( m => m.date.startsWith( dateStr ) );
        if ( existing ) {
            paddedData.push( existing );
        } else {
            paddedData.push( {
                id: `empty-${dateStr}`,
                partnerId: 'unknown',
                date: dateStr,
                requests: 0,
                errors: 0,
                latencyMs: 0,
            } );
        }
    }

    // Sort data by date ascending for the chart
    const sortedData = paddedData.sort( ( a, b ) => new Date( a.date ).getTime() - new Date( b.date ).getTime() );

    // Format dates to short month/day
    const chartData = sortedData.map( d => ( {
        ...d,
        displayDate: new Date( d.date ).toLocaleDateString( 'en-US', { month: 'short', day: 'numeric' } )
    } ) );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Total Requests (30d)</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="displayDate"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                minTickGap={30}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickFormatter={( value ) => `${( value / 1000 ).toFixed( 0 )}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                            />
                            <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">Latency & Errors</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="displayDate"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                minTickGap={30}
                            />
                            <YAxis
                                yAxisId="left"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                tickFormatter={( value ) => `${value}ms`}
                            />
                            <YAxis
                                yAxisId="right" orientation="right"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line yAxisId="left" type="monotone" dataKey="latencyMs" name="Latency" stroke="#10b981" strokeWidth={2} dot={false} />
                            <Line yAxisId="right" type="step" dataKey="errors" name="Errors" stroke="#ef4444" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
