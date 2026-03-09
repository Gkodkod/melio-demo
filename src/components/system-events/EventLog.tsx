'use client';

import { useState } from 'react';
import { SystemEvent } from '@/types/system-events';
import {
    ChevronDown,
    ChevronRight,
    Terminal,
    Info,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

interface EventLogProps {
    events: SystemEvent[];
    onEventClick?: ( event: SystemEvent ) => void;
    selectedCorrelationId?: string | null;
}

const statusConfig = {
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    error: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' }
};

export default function EventLog( { events, onEventClick, selectedCorrelationId }: EventLogProps ) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>( new Set() );
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const toggleRow = ( id: string, e: React.MouseEvent ) => {
        e.stopPropagation();
        const newExpanded = new Set( expandedRows );
        if ( newExpanded.has( id ) ) {
            newExpanded.delete( id );
        } else {
            newExpanded.add( id );
        }
        setExpandedRows( newExpanded );
    };

    return (
        <div className={cn(
            "rounded-xl border shadow-sm overflow-hidden flex flex-col h-full",
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
            <div className={cn(
                "px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10",
                isDark ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"
            )}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <Terminal size={16} className={isDark ? "text-slate-400" : "text-slate-500"} />
                    <span className={isDark ? "text-slate-200" : "text-slate-800"}>Live Event Stream</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className={cn( "text-xs font-medium", isDark ? "text-slate-400" : "text-slate-500" )}>
                        {events.length} events
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-auto min-h-0 divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1 relative">
                {events.length === 0 ? (
                    <div className={cn( "p-8 text-center text-sm", isDark ? "text-slate-500" : "text-slate-400" )}>
                        No events found matching your filter.
                    </div>
                ) : (
                    events.map( ( event ) => {
                        const isExpanded = expandedRows.has( event.id );
                        const isSelected = selectedCorrelationId === event.correlationId;
                        const StatusIcon = statusConfig[event.status].icon;

                        return (
                            <div
                                key={event.id}
                                className={cn(
                                    "rounded-lg transition-all duration-200 overflow-hidden isolate",
                                    isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50",
                                    isSelected && ( isDark ? "bg-indigo-900/20 ring-1 ring-indigo-500/30" : "bg-indigo-50 ring-1 ring-indigo-200" )
                                )}
                                onClick={() => onEventClick?.( event )}
                            >
                                <div className="px-3 py-2.5 flex items-start gap-3 cursor-pointer select-none">
                                    {/* Status Indicator */}
                                    <div className={cn(
                                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
                                        statusConfig[event.status].bg,
                                        statusConfig[event.status].color
                                    )}>
                                        <StatusIcon size={16} />
                                    </div>

                                    {/* Main Event Data */}
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className={cn(
                                                    "font-mono text-[13px] font-semibold tracking-tight truncate",
                                                    isDark ? "text-slate-200" : "text-slate-900"
                                                )}>
                                                    {event.type}
                                                </span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border",
                                                    isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-600"
                                                )}>
                                                    {event.service}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] font-mono whitespace-nowrap">
                                                <Clock size={12} className={isDark ? "text-slate-500" : "text-slate-400"} />
                                                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                                                    {format( new Date( event.timestamp ), 'HH:mm:ss.SSS' )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs">
                                            <div className={cn( "font-mono truncate", isDark ? "text-slate-500" : "text-slate-400" )}>
                                                corr_id: <span className={cn( isDark ? "text-indigo-400" : "text-indigo-600" )}>{event.correlationId}</span>
                                            </div>

                                            <button
                                                onClick={( e ) => toggleRow( event.id, e )}
                                                className={cn(
                                                    "flex items-center gap-1 hover:text-indigo-500 transition-colors px-2 py-0.5 rounded",
                                                    isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-200"
                                                )}
                                            >
                                                <span className="text-[10px] uppercase font-bold tracking-wider">Payload</span>
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Payload Section */}
                                {isExpanded && (
                                    <div className={cn(
                                        "px-4 py-3 border-t text-xs font-mono overflow-x-auto",
                                        isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
                                    )}>
                                        <pre className={cn( "whitespace-pre-wrap break-all", isDark ? "text-emerald-400" : "text-emerald-700" )}>
                                            {JSON.stringify( { payload: event.payload, metadata: event.metadata }, null, 2 )}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        );
                    } )
                )}
            </div>
        </div>
    );
}
