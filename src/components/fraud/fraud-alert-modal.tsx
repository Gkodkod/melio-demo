'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
    ShieldAlert,
    AlertTriangle,
    X,
    Building2,
} from 'lucide-react';
import StatusBadge from '@/components/status-badge';
import RiskScoreBar from '@/components/risk-score-bar';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import type { FraudAlert, RiskLevel } from '@/lib/types';

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

export default function FraudAlertModal() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedAlertId = searchParams.get( 'alertId' );

    const { data: alertDetail, isLoading } = useQuery<AlertDetail>( {
        queryKey: ['fraud-alert-detail', selectedAlertId],
        queryFn: () => fetch( `/api/fraud-monitor/alerts/${selectedAlertId}` ).then( ( r ) => r.json() ),
        enabled: !!selectedAlertId,
    } );

    const handleClose = () => {
        const params = new URLSearchParams( searchParams.toString() );
        params.delete( 'alertId' );
        router.push( `${pathname}?${params.toString()}`, { scroll: false } );
    };

    if ( !selectedAlertId ) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
        >
            <div
                className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={( e ) => e.stopPropagation()}
            >
                {isLoading || !alertDetail ? (
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
                                onClick={handleClose}
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
                            onClick={handleClose}
                            className="w-full mt-6 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            Close
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
