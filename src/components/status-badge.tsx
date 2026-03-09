import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusStyles: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',
    scheduled: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    processing: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    settled: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 ring-red-500/20',
    pending: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 ring-red-500/20',
    paid: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    verified: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    investigating: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    cleared: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    confirmed: 'bg-red-500/10 text-red-400 ring-red-500/20',
};

export default function StatusBadge( { status, className }: StatusBadgeProps ) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset capitalize',
                statusStyles[status] || 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
                className
            )}
        >
            {status}
        </span>
    );
}
