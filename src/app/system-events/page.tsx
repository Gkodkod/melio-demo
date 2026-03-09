'use client';

import { useState, useEffect, useMemo } from 'react';
import { MOCK_EVENTS, generateRandomEvent } from '@/data/mock-system-events';
import { SystemEvent, ServiceType, EventStatus } from '@/types/system-events';
import EventLog from '@/components/system-events/EventLog';
import EventTimeline from '@/components/system-events/EventTimeline';
import ServiceArchitecture from '@/components/system-events/ServiceArchitecture';
import PageHeader from '@/components/page-header';
import { Search, Filter, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

// Hardcoded lists for filters based on mock data & types
const SERVICES: ServiceType[] = [
    'API Gateway',
    'Payment Service',
    'Fraud Service',
    'Settlement Service',
    'Notification Service'
];

const STATUSES: EventStatus[] = ['info', 'success', 'warning', 'error'];

export default function SystemEventsDashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [events, setEvents] = useState<SystemEvent[]>( [] );
    const [isStreaming, setIsStreaming] = useState( true );
    const [selectedCorrelationId, setSelectedCorrelationId] = useState<string | null>( null );

    // Filters
    const [searchFilter, setSearchFilter] = useState( '' );
    const [serviceFilter, setServiceFilter] = useState<ServiceType | 'All'>( 'All' );
    const [statusFilter, setStatusFilter] = useState<EventStatus | 'All'>( 'All' );

    // Initialize and Stream Events
    useEffect( () => {
        // Initial load
        setEvents( [...MOCK_EVENTS].sort( ( a, b ) => new Date( b.timestamp ).getTime() - new Date( a.timestamp ).getTime() ) );

        let interval: NodeJS.Timeout;
        if ( isStreaming ) {
            interval = setInterval( () => {
                setEvents( prev => {
                    const newEvent = generateRandomEvent();
                    return [newEvent, ...prev].slice( 0, 500 ); // Keep last 500 events
                } );
            }, 4000 );
        }

        return () => clearInterval( interval );
    }, [isStreaming] );

    // Derived filtered events list
    const filteredEvents = useMemo( () => {
        return events.filter( e => {
            let matchesSearch = true;
            if ( searchFilter ) {
                const query = searchFilter.toLowerCase();
                matchesSearch =
                    e.correlationId.toLowerCase().includes( query ) ||
                    e.type.toLowerCase().includes( query );
            }

            const matchesService = serviceFilter === 'All' || e.service === serviceFilter;
            const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

            return matchesSearch && matchesService && matchesStatus;
        } );
    }, [events, searchFilter, serviceFilter, statusFilter] );

    return (
        <div className="flex-1 space-y-6">
            <PageHeader
                title="System Events"
                description="Live payment orchestration and service telemetry."
                action={
                    <button
                        onClick={() => setIsStreaming( !isStreaming )}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all",
                            isStreaming
                                ? ( isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200" )
                                : ( isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-white text-slate-600 border-slate-200" )
                        )}
                    >
                        <Activity size={16} className={cn( isStreaming && "animate-pulse" )} />
                        {isStreaming ? 'Stream Live' : 'Stream Paused'}
                    </button>
                }
            />

            {/* Filter Bar */}
            <div className={cn(
                "flex flex-col sm:flex-row gap-4 p-4 rounded-xl border shadow-sm",
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            )}>
                <div className="flex-1 relative">
                    <Search size={16} className={cn( "absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-slate-500" : "text-slate-400" )} />
                    <input
                        type="text"
                        placeholder="Search by correlation ID or event type..."
                        value={searchFilter}
                        onChange={e => setSearchFilter( e.target.value )}
                        className={cn(
                            "w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 transition-all",
                            isDark
                                ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-indigo-500/50"
                                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-indigo-500/20 focus:border-indigo-300"
                        )}
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className={isDark ? "text-slate-500" : "text-slate-400"} />
                        <select
                            value={serviceFilter}
                            onChange={e => setServiceFilter( e.target.value as ServiceType | 'All' )}
                            className={cn(
                                "py-2 pl-3 pr-8 rounded-lg text-sm border appearance-none focus:outline-none focus:ring-2",
                                isDark
                                    ? "bg-slate-950 border-slate-800 text-slate-300 focus:ring-indigo-500/50"
                                    : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-indigo-500/20 focus:border-indigo-300"
                            )}
                        >
                            <option value="All">All Services</option>
                            {SERVICES.map( s => <option key={s} value={s}>{s}</option> )}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter( e.target.value as EventStatus | 'All' )}
                            className={cn(
                                "py-2 pl-3 pr-8 rounded-lg text-sm border appearance-none focus:outline-none focus:ring-2",
                                isDark
                                    ? "bg-slate-950 border-slate-800 text-slate-300 focus:ring-indigo-500/50"
                                    : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-indigo-500/20 focus:border-indigo-300"
                            )}
                        >
                            <option value="All">All Statuses</option>
                            {STATUSES.map( s => <option key={s} value={s}>{s.charAt( 0 ).toUpperCase() + s.slice( 1 )}</option> )}
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[720px]">
                {/* Left Column: Event List (Spans 1 col, or full width on small) */}
                <div className="xl:col-span-1 h-full">
                    <EventLog
                        events={filteredEvents}
                        selectedCorrelationId={selectedCorrelationId}
                        onEventClick={( evt ) => setSelectedCorrelationId( evt.correlationId )}
                    />
                </div>

                {/* Right Column: Visualizations (Spans 2 cols) */}
                <div className="xl:col-span-2 flex flex-col gap-6 h-full">

                    {/* Top Half: Architecture Diagram */}
                    <div className="h-[360px] shrink-0">
                        <ServiceArchitecture events={events} />
                    </div>

                    {/* Bottom Half: Lifecycle Timeline */}
                    <div className="flex-1 min-h-[300px]">
                        <EventTimeline
                            events={events} // Provide all events so it can trace the full lifecycle
                            correlationId={selectedCorrelationId}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
