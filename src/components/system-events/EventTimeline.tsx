'use client';

import { SystemEvent } from '@/types/system-events';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { CheckCircle2, Clock, AlertCircle, CircleDashed } from 'lucide-react';
import { format } from 'date-fns';

interface EventTimelineProps {
    correlationId: string | null;
    events: SystemEvent[];
}

const LIFECYCLE_STAGES = [
    { id: 'payment.created', label: 'Payment Created', icon: CircleDashed },
    { id: 'fraud.check', label: 'Fraud Check', icon: CircleDashed },
    { id: 'payment.authorized', label: 'Payment Authorized', icon: CircleDashed },
    { id: 'payment.settlement', label: 'Settlement', icon: CircleDashed },
    { id: 'notification.sent', label: 'Notification Sent', icon: CircleDashed },
];

export default function EventTimeline( { correlationId, events }: EventTimelineProps ) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if ( !correlationId ) {
        return (
            <div className={cn(
                "rounded-xl border shadow-sm p-4 pt-10 h-full flex flex-col items-center justify-start text-center",
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
                <div className={cn( "w-16 h-16 rounded-full flex items-center justify-center mb-4",
                    isDark ? "bg-slate-800" : "bg-slate-100"
                )}>
                    <Clock size={24} className={isDark ? "text-slate-500" : "text-slate-400"} />
                </div>
                <h3 className={cn( "text-sm font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700" )}>
                    Select a Correlation ID
                </h3>
                <p className={cn( "text-xs max-w-[200px]", isDark ? "text-slate-500" : "text-slate-500" )}>
                    Click on any event in the log to view its complete lifecycle timeline.
                </p>
            </div>
        );
    }

    // Filter events matching the selected correlationId and sort by time
    const relatedEvents = events
        .filter( e => e.correlationId === correlationId )
        .sort( ( a, b ) => new Date( a.timestamp ).getTime() - new Date( b.timestamp ).getTime() );

    // Try to map actual events to the linear lifecycle
    const getStageStatus = ( stageId: string ) => {
        // Exact or prefix match since 'fraud.check.started/completed' maps to 'fraud.check'
        const matchingEvents = relatedEvents.filter( e => e.type.startsWith( stageId ) );

        if ( matchingEvents.length === 0 ) return { status: 'pending', event: null };

        // Check if any error occurred in this stage
        const hasError = matchingEvents.some( e => e.status === 'error' );
        if ( hasError ) return { status: 'error', event: matchingEvents.find( e => e.status === 'error' ) };

        // Check if it's completed or still in-progress/info
        // We assume if it has a match, and no error, it's either success or in progress.
        // Let's use the latest matching event.
        const latestEvent = matchingEvents[matchingEvents.length - 1];

        if ( latestEvent.status === 'success' || latestEvent.type.includes( 'completed' ) ) {
            return { status: 'completed', event: latestEvent };
        }

        return { status: 'processing', event: latestEvent };
    };

    return (
        <div className={cn(
            "rounded-xl border shadow-sm flex flex-col h-full",
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
            <div className={cn(
                "px-5 py-4 border-b",
                isDark ? "border-slate-800" : "border-slate-200"
            )}>
                <h3 className={cn( "text-sm font-semibold flex items-center gap-2", isDark ? "text-slate-200" : "text-slate-800" )}>
                    <Clock size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                    Payment Lifecycle
                </h3>
                <p className={cn( "text-xs font-mono mt-1", isDark ? "text-slate-500" : "text-slate-500" )}>
                    corr_id: <span className={cn( "font-semibold", isDark ? "text-slate-300" : "text-slate-700" )}>{correlationId}</span>
                </p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto min-h-0">
                <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
                    {LIFECYCLE_STAGES.map( ( stage ) => {
                        const { status, event } = getStageStatus( stage.id );

                        let Icon = CircleDashed;
                        let iconColor = isDark ? "text-slate-600 bg-slate-900" : "text-slate-400 bg-white";
                        let borderColor = isDark ? "border-slate-700" : "border-slate-300";

                        if ( status === 'completed' ) {
                            Icon = CheckCircle2;
                            iconColor = isDark ? "text-emerald-400 bg-slate-900" : "text-emerald-500 bg-white";
                            borderColor = isDark ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50";
                        } else if ( status === 'processing' ) {
                            Icon = Clock;
                            iconColor = isDark ? "text-indigo-400 bg-slate-900" : "text-indigo-500 bg-white";
                            borderColor = isDark ? "border-indigo-500/30 bg-indigo-500/10" : "border-indigo-200 bg-indigo-50";
                        } else if ( status === 'error' ) {
                            Icon = AlertCircle;
                            iconColor = isDark ? "text-rose-400 bg-slate-900" : "text-rose-500 bg-white";
                            borderColor = isDark ? "border-rose-500/30 bg-rose-500/10" : "border-rose-200 bg-rose-50";
                        }

                        return (
                            <div key={stage.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Connector Line Logic implicitly handled by wrapper before element */}

                                {/* Timeline Node */}
                                <div className={cn(
                                    "flex items-center justify-center w-6 h-6 rounded-full border-2 z-10 -ml-11 md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2",
                                    iconColor
                                )}>
                                    <Icon size={14} className={cn( status === 'processing' && "animate-pulse" )} />
                                </div>

                                {/* Content Box */}
                                <div className={cn(
                                    "w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border shadow-sm transition-all",
                                    borderColor,
                                    status === 'pending' && "opacity-50"
                                )}>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={cn( "text-sm font-bold", isDark ? "text-slate-200" : "text-slate-800" )}>
                                            {stage.label}
                                        </h4>
                                        {event && (
                                            <span className={cn( "text-[10px] font-mono", isDark ? "text-slate-500" : "text-slate-500" )}>
                                                {format( new Date( event.timestamp ), 'HH:mm:ss' )}
                                            </span>
                                        )}
                                    </div>

                                    {event ? (
                                        <div className="space-y-2 mt-2">
                                            <p className={cn( "text-xs font-mono", isDark ? "text-slate-400" : "text-slate-600" )}>
                                                {event.type}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries( event.payload ).slice( 0, 2 ).map( ( [k, v] ) => (
                                                    <span key={k} className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1",
                                                        isDark ? "bg-slate-800 text-slate-300" : "bg-white border text-slate-600"
                                                    )}>
                                                        <span className="opacity-70">{k}:</span> {String( v )}
                                                    </span>
                                                ) )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={cn( "text-xs line-clamp-1 italic", isDark ? "text-slate-500" : "text-slate-400" )}>
                                            Awaiting event...
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    } )}
                </div>
            </div>
        </div>
    );
}
