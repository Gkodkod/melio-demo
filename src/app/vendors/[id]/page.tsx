import { getVendorById, getPaymentsByVendorId, getInvoicesByVendorId } from '@/lib/data';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Landmark,
    Shield,
} from 'lucide-react';
import StatusBadge from '@/components/status-badge';
import { VendorPaymentsTable, VendorInvoicesTable } from '@/components/vendors/vendor-detail-tables';
import { formatCurrency, formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface VendorDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function VendorDetailPage( { params }: VendorDetailPageProps ) {
    const { id } = await params;

    const [vendor, payments, invoices] = await Promise.all( [
        getVendorById( id ),
        getPaymentsByVendorId( id ),
        getInvoicesByVendorId( id ),
    ] );

    if ( !vendor ) {
        notFound();
    }


    return (
        <div className="space-y-8 pt-8 lg:pt-0">
            <Link
                href="/vendors"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-fit"
            >
                <ArrowLeft size={16} />
                Back to Vendors
            </Link>

            {/* Vendor Header */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Building2 size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white">{vendor.name}</h2>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Mail size={14} /> {vendor.email}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <Phone size={14} /> {vendor.phone}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <MapPin size={14} /> {vendor.address}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">{formatCurrency( vendor.totalPaid )}</p>
                        <p className="text-xs text-slate-500 mt-1">Total Paid</p>
                    </div>
                </div>
            </div>

            {/* Payment Method Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <CreditCard size={16} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Payment Method</h3>
                    </div>
                    <p className="text-lg font-semibold text-white uppercase">{vendor.paymentMethod}</p>
                    <p className="text-sm text-slate-500 mt-1">•••• {vendor.accountLast4}</p>
                </div>
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <Landmark size={16} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Bank Info</h3>
                    </div>
                    <p className="text-lg font-semibold text-white">
                        {vendor.bankName || 'N/A'}
                    </p>
                    {vendor.routingNumber && (
                        <p className="text-sm text-slate-500 mt-1">Routing: {vendor.routingNumber}</p>
                    )}
                </div>
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                        <Shield size={16} />
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Verification</h3>
                    </div>
                    <StatusBadge status={vendor.bankVerificationStatus} />
                    <p className="text-sm text-slate-500 mt-2">Added {formatDate( vendor.createdAt )}</p>
                </div>
            </div>

            {/* Vendor Invoices */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Invoices ({invoices.length})</h3>
                <VendorInvoicesTable invoices={invoices} />
            </div>

            {/* Vendor Payments */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Payments ({payments.length})</h3>
                <VendorPaymentsTable payments={payments} />
            </div>
        </div>
    );
}

export const dynamic = 'force-dynamic';
