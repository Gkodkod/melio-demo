'use client';

import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

interface RiskScoreBarProps {
    score: number;
    level?: RiskLevel;
    showLabel?: boolean;
    className?: string;
}

const levelColors: Record<RiskLevel, { bar: string; bg: string; text: string }> = {
    low: { bar: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    medium: { bar: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-400' },
    high: { bar: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
};

export default function RiskScoreBar( { score, level, showLabel = true, className }: RiskScoreBarProps ) {
    const riskLevel = level || ( score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low' );
    const colors = levelColors[riskLevel];

    return (
        <div className={cn( 'flex items-center gap-2', className )}>
            <div className={cn( 'flex-1 h-2 rounded-full overflow-hidden min-w-[60px]', colors.bg )}>
                <div
                    className={cn( 'h-full rounded-full transition-all duration-500', colors.bar )}
                    style={{ width: `${score}%` }}
                />
            </div>
            {showLabel && (
                <span className={cn( 'text-xs font-bold tabular-nums min-w-[28px]', colors.text )}>
                    {score}
                </span>
            )}
        </div>
    );
}
