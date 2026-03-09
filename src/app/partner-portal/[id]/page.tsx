import { Metadata } from 'next';
import { getDb, mapPartner, mapPartnerApiKey, mapPartnerWebhookSubscription, mapPartnerApiMetric } from '@/lib/db';
import { Partner, PartnerApiKey, WebhookSubscription, ApiUsageMetric } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { Activity, CalendarClock, Globe } from 'lucide-react';
import Link from 'next/link';
import StatusBadge from '@/components/status-badge';
import { notFound } from 'next/navigation';
import ApiKeysManager from '@/components/partner-portal/api-keys-manager';
import WebhookManager from '@/components/partner-portal/webhook-manager';
import MetricsChart from '@/components/partner-portal/metrics-charts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Partner Detail | Melio',
};

export default async function PartnerDetailPage( { params }: { params: { id: string } } ) {
    const supabase = getDb();

    const { data: partnerRow } = await supabase
        .from( 'partners' ).select( '*' ).eq( 'id', params.id ).single();
    if ( !partnerRow ) notFound();
    const partner = mapPartner( partnerRow as Record<string, unknown> ) as Partner;

    const [
        { data: keyRows },
        { data: subRows },
        { data: metricRows },
    ] = await Promise.all( [
        supabase.from( 'partner_api_keys' ).select( '*' ).eq( 'partner_id', partner.id ).order( 'created_at', { ascending: false } ),
        supabase.from( 'partner_webhook_subscriptions' ).select( '*' ).eq( 'partner_id', partner.id ).order( 'event_type', { ascending: true } ),
        supabase.from( 'partner_api_metrics' ).select( '*' ).eq( 'partner_id', partner.id ).order( 'date', { ascending: true } ),
    ] );

    const apiKeys = ( keyRows ?? [] ).map( ( r: Record<string, unknown> ) => mapPartnerApiKey( r ) ) as PartnerApiKey[];
    const subscriptions = ( subRows ?? [] ).map( ( r: Record<string, unknown> ) => mapPartnerWebhookSubscription( r ) ) as WebhookSubscription[];
    const metrics = ( metricRows ?? [] ).map( ( r: Record<string, unknown> ) => mapPartnerApiMetric( r ) ) as ApiUsageMetric[];

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Link href="/partner-portal" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
                    &larr; Back to Partners
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <PageHeader
                    title={partner.name}
                    description={`Partner Integrator | ID: ${partner.id}`}
                />
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl shadow-sm">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2">Account:</span>
                    <StatusBadge status={partner.status} />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2 pl-4 border-l border-slate-200 dark:border-slate-700">Health:</span>
                    <StatusBadge status={partner.integrationStatus} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total API Usage</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            {new Intl.NumberFormat().format( partner.apiUsage )}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <Globe size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Webhooks</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {subscriptions.length}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                        <CalendarClock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Partner Since</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {new Date( partner.createdAt as string ).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <MetricsChart data={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-stretch">
                <ApiKeysManager partnerId={partner.id} apiKeys={apiKeys} />
                <WebhookManager partnerId={partner.id} webhookUrl={partner.webhookUrl as string || ''} subscriptions={subscriptions} />
            </div>
        </div>
    );
}
