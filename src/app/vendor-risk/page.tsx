import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import nextDynamic from 'next/dynamic';
import {
    ShieldAlert,
    Activity,
    AlertTriangle,
} from 'lucide-react';
import SummaryCard from '@/components/summary-card';
import PageHeader from '@/components/page-header';
import VendorRiskTable from '@/components/vendor-risk/vendor-risk-table';
import { getVendorRiskSummary } from '@/lib/data';

export const metadata: Metadata = {
    title: 'Vendor Risk | Melio',
    description: 'Monitor vendor-level risk scores, payment velocity, and anomalies.',
};

const VendorRiskCharts = nextDynamic( () => import( '@/components/vendor-risk/vendor-risk-charts' ), {
    loading: () => <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px] bg-slate-800/20 animate-pulse rounded-2xl" />,
} );

export default async function VendorRiskPage() {
    noStore(); // Bypass cache to show fresh fraud data

    const summary = await getVendorRiskSummary();

    const vendors = summary.vendors || [];
    const highRiskCount = vendors.filter( ( v ) => v.riskLevel === 'high' ).length;
    const avgScore = vendors.length
        ? ( vendors.reduce( ( acc, v ) => acc + v.score, 0 ) / vendors.length ).toFixed( 1 )
        : '—';
    const totalAnomalies = vendors.reduce( ( acc, v ) => acc + v.anomalies.length, 0 );

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
            <div className="min-h-[300px] w-full">
                <VendorRiskCharts summary={summary} />
            </div>

            {/* ── Table ── */}
            <VendorRiskTable vendors={vendors} />
        </div>
    );
}

export const dynamic = 'force-dynamic';
