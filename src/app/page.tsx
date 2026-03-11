import { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Dashboard | Melio',
  description: 'View your payment volume, status distribution, and recent activity.',
};
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import SummaryCard from '@/components/summary-card';
import StatusBadge from '@/components/status-badge';
import PageHeader from '@/components/page-header';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { getDashboardSummary, getPayments, getTransactionEvents } from '@/lib/data';

// Dynamic imports for heavy charts
const VolumeChart = dynamic( () => import( '@/components/dashboard/volume-chart' ), {
  loading: () => <div className="lg:col-span-2 h-[350px] bg-slate-800/20 animate-pulse rounded-2xl" />,
} );

const StatusChart = dynamic( () => import( '@/components/dashboard/status-chart' ), {
  loading: () => <div className="h-[350px] bg-slate-800/20 animate-pulse rounded-2xl" />,
} );

export default async function DashboardPage() {
  const [summary, payments, events] = await Promise.all( [
    getDashboardSummary(),
    getPayments(),
    getTransactionEvents(),
  ] );

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
        <VolumeChart />
        <StatusChart payments={payments} />
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
