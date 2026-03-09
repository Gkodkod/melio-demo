import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    gradient: string;
    iconBg: string;
}

export default function SummaryCard( {
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendUp,
    gradient,
    iconBg,
}: SummaryCardProps ) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg',
                gradient
            )}
        >
            {/* Decorative circle */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/5" />

            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <div
                        className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl',
                            iconBg
                        )}
                    >
                        <Icon size={20} />
                    </div>
                    {trend && (
                        <span
                            className={cn(
                                'text-xs font-semibold px-2 py-1 rounded-lg',
                                trendUp ? 'bg-white/20' : 'bg-white/10'
                            )}
                        >
                            {trend}
                        </span>
                    )}
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-sm font-medium opacity-80">{title}</p>
                {subtitle && (
                    <p className="mt-1 text-xs opacity-60">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
