import { Metadata } from 'next';
import { getDb, mapPartner } from '@/lib/db';
import { Partner } from '@/lib/types';
import PageHeader from '@/components/page-header';
import Link from 'next/link';
import StatusBadge from '@/components/status-badge';

export const metadata: Metadata = {
    title: 'Partner Integrations | Melio',
    description: 'Manage external partner integrations.',
};

export default async function PartnerPortalPage() {
    const supabase = getDb();
    const { data: rows } = await supabase
        .from( 'partners' ).select( '*' ).order( 'name', { ascending: true } );
    const partners = ( rows ?? [] ).map( ( r: Record<string, unknown> ) => mapPartner( r ) ) as Partner[];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Partner Integrations"
                description="Simulator for onboarding external partners, monitoring their API usage and managing connections."
            />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/50 h-12">
                            <tr>
                                <th className="px-6 font-medium">Partner Name</th>
                                <th className="px-6 font-medium">Status</th>
                                <th className="px-6 font-medium">Integration Health</th>
                                <th className="px-6 font-medium text-right">30d Requests</th>
                                <th className="px-6 font-medium text-right">Created Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {partners.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                                        No partners found.
                                    </td>
                                </tr>
                            )}
                            {partners.map( ( p ) => (
                                <tr
                                    key={p.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors group h-16"
                                >
                                    <td className="px-6">
                                        <Link
                                            href={`/partner-portal/${p.id}`}
                                            className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                                        >
                                            {p.name}
                                        </Link>
                                    </td>
                                    <td className="px-6">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    <td className="px-6">
                                        <StatusBadge status={p.integrationStatus} />
                                    </td>
                                    <td className="px-6 text-right tabular-nums text-slate-600 dark:text-slate-300">
                                        {new Intl.NumberFormat().format( p.apiUsage )}
                                    </td>
                                    <td className="px-6 text-right text-slate-500 dark:text-slate-400 tabular-nums">
                                        {new Date( p.createdAt as string ).toLocaleDateString()}
                                    </td>
                                </tr>
                            ) )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
