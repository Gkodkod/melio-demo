'use client';

import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import SummaryCard from '@/components/summary-card';
import StatusBadge from '@/components/status-badge';
import PageHeader from '@/components/page-header';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { DashboardSummary, Payment, TransactionEvent } from '@/lib/types';

const PIE_COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

const volumeData = [
  { month: 'Sep', volume: 18200 },
  { month: 'Oct', volume: 24800 },
  { month: 'Nov', volume: 31500 },
  { month: 'Dec', volume: 28700 },
  { month: 'Jan', volume: 35200 },
  { month: 'Feb', volume: 42100 },
  { month: 'Mar', volume: 53550 },
];

export default function DashboardPage() {
  const { data: summary } = useQuery<DashboardSummary>( {
    queryKey: ['dashboard'],
    queryFn: () => fetch( '/api/dashboard' ).then( ( r ) => r.json() ),
  } );

  const { data: payments } = useQuery<Payment[]>( {
    queryKey: ['payments'],
    queryFn: () => fetch( '/api/payments' ).then( ( r ) => r.json() ),
  } );

  const { data: events } = useQuery<TransactionEvent[]>( {
    queryKey: ['transactions'],
    queryFn: () => fetch( '/api/transactions' ).then( ( r ) => r.json() ),
  } );

  const statusDistribution = payments
    ? [
      { name: 'Draft', value: payments.filter( ( p ) => p.status === 'draft' ).length },
      { name: 'Scheduled', value: payments.filter( ( p ) => p.status === 'scheduled' ).length },
      { name: 'Processing', value: payments.filter( ( p ) => p.status === 'processing' ).length },
      { name: 'Settled', value: payments.filter( ( p ) => p.status === 'settled' ).length },
      { name: 'Failed', value: payments.filter( ( p ) => p.status === 'failed' ).length },
    ].filter( ( d ) => d.value > 0 )
    : [];

  return (
    <div className="space-y-8 pt-8 lg:pt-0">
      <PageHeader
        title="Dashboard"
        description="Overview of your vendor payments and activity"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          title="Total Payments"
          value={summary ? String( summary.totalPayments ) : '—'}
          subtitle={summary ? formatCurrency( summary.totalVolume ) + ' total volume' : ''}
          icon={DollarSign}
          trend="+12%"
          trendUp
          gradient="bg-gradient-to-br from-indigo-600 to-indigo-800"
          iconBg="bg-white/20"
        />
        <SummaryCard
          title="Pending"
          value={summary ? String( summary.pendingPayments ) : '—'}
          subtitle={summary ? formatCurrency( summary.pendingVolume ) + ' pending' : ''}
          icon={Clock}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          iconBg="bg-white/20"
        />
        <SummaryCard
          title="Completed"
          value={summary ? String( summary.completedPayments ) : '—'}
          icon={CheckCircle2}
          trend="On track"
          trendUp
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          iconBg="bg-white/20"
        />
        <SummaryCard
          title="Failed"
          value={summary ? String( summary.failedPayments ) : '—'}
          icon={XCircle}
          gradient="bg-gradient-to-br from-red-500 to-rose-600"
          iconBg="bg-white/20"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Payment Volume Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Payment Volume</h3>
              <p className="text-sm text-slate-400">Monthly payment trends</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
              <TrendingUp size={16} />
              +27%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={( v ) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={( value: any ) => [formatCurrency( Number( value ) ), 'Volume']}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Status Distribution</h3>
          <p className="text-sm text-slate-400 mb-4">Current payment statuses</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {statusDistribution.map( ( _, index ) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ) )}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {statusDistribution.map( ( item, i ) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {item.name}
              </div>
            ) )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <p className="text-sm text-slate-400">Latest payment events</p>
          </div>
        </div>
        <div className="space-y-4">
          {events?.slice( 0, 8 ).map( ( event ) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${event.type === 'payment.settled'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : event.type === 'payment.failed'
                      ? 'bg-red-500/10 text-red-400'
                      : event.type === 'payment.processing'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                >
                  {event.type === 'payment.settled' ? (
                    <CheckCircle2 size={18} />
                  ) : event.type === 'payment.failed' ? (
                    <XCircle size={18} />
                  ) : (
                    <ArrowUpRight size={18} />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {event.data.vendorName}
                </p>
                <p className="text-xs text-slate-500">
                  {event.type.replace( '.', ' → ' )} • {formatDateTime( event.timestamp )}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-white">
                  {formatCurrency( event.data.amount )}
                </p>
                <StatusBadge status={event.data.status} />
              </div>
            </div>
          ) )}
        </div>
      </div>
    </div>
  );
}
