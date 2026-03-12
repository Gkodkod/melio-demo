import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import nextDynamic from 'next/dynamic';

export const metadata: Metadata = {
    title: 'Fraud Monitor | Melio',
    description: 'Monitor suspicious activity and risk scores in real-time.',
};
import {
    ShieldAlert,
    AlertTriangle,
    Clock,
    CheckCircle2,
} from 'lucide-react';
import SummaryCard from '@/components/summary-card';
import PageHeader from '@/components/page-header';
import { getFraudAlerts, getFraudSummary } from '@/lib/data';
import FraudFilters from '@/components/fraud/fraud-filters';
import FraudAlertsTable from '@/components/fraud/fraud-alerts-table';

// Dynamic imports for heavy or conditional components
const FraudCharts = nextDynamic( () => import( '@/components/fraud/fraud-charts' ), {
    loading: () => <div className="grid grid-cols-1 lg:col-span-2 gap-6 h-[280px] bg-slate-800/20 animate-pulse rounded-2xl" />,
} );

const FraudAlertModal = nextDynamic( () => import( '@/components/fraud/fraud-alert-modal' ) );

interface PageProps {
    searchParams: Promise<{
        q?: string;
        risk?: string;
        alertId?: string;
    }>;
}

export default async function FraudMonitorPage( { searchParams }: PageProps ) {
    noStore();
    const { q: search = '', risk: riskFilter = 'all', alertId } = await searchParams;

    // Summary data
    const summary = await getFraudSummary();

    // All alerts
    const alerts = await getFraudAlerts();

    // ── Filtered alerts ────────────────────────────────────────────
    const filtered = alerts.filter( ( a ) => {
        const matchesSearch =
            a.paymentId.toLowerCase().includes( search.toLowerCase() ) ||
            a.vendorName.toLowerCase().includes( search.toLowerCase() );
        const matchesRisk = riskFilter === 'all' || a.riskLevel === riskFilter;
        return matchesSearch && matchesRisk;
    } );

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
            <FraudCharts summary={summary} />

            {/* ── Filters ────────────────────────────────────────────── */}
            <FraudFilters />

            {/* ── Suspicious Payments Table ───────────────────────────── */}
            <FraudAlertsTable alerts={filtered} />

            {/* ── Alert Detail Modal ─────────────────────────────────── */}
            {alertId && <FraudAlertModal />}
        </div>
    );
}

export const dynamic = 'force-dynamic';
