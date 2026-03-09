'use client';

import { SystemEvent, ServiceType } from '@/types/system-events';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { Network, Database, ShieldCheck, Mail, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ServiceArchitectureProps {
    events: SystemEvent[];
}

// Fixed position nodes for the architecture map
const SERVICES = [
    { id: 'API Gateway', label: 'API Gateway', icon: Network, pos: 'col-start-1 row-start-2' },
    { id: 'Fraud Service', label: 'Fraud Engine', icon: ShieldCheck, pos: 'col-start-2 row-start-1' },
    { id: 'Payment Service', label: 'Payment Core', icon: Cpu, pos: 'col-start-2 row-start-2' },
    { id: 'Settlement Service', label: 'Ledger/Settlement', icon: Database, pos: 'col-start-3 row-start-2' },
    { id: 'Notification Service', label: 'Notifications', icon: Mail, pos: 'col-start-3 row-start-1' },
];

export default function ServiceArchitecture( { events }: ServiceArchitectureProps ) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [activeServices, setActiveServices] = useState<Set<ServiceType>>( new Set() );
    const [pulseService, setPulseService] = useState<ServiceType | null>( null );

    // When events change (new event arrives), highlight the active service briefly
    useEffect( () => {
        if ( events.length > 0 ) {
            const latestEvent = events[0]; // Assuming events are sorted newest first, or just take the top one
            // If we're tracking purely the newest event added to the feed:
            setPulseService( latestEvent.service );
            setActiveServices( prev => new Set( prev ).add( latestEvent.service ) );

            const timer = setTimeout( () => {
                setPulseService( null );
            }, 1000 );

            return () => clearTimeout( timer );
        }
    }, [events] );

    return (
        <div className={cn(
            "rounded-xl border shadow-sm p-5 h-full flex flex-col items-center justify-start relative overflow-hidden",
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
            {/* Background decoration */}
            <div className={cn(
                "absolute inset-0 opacity-[0.03] pointer-events-none",
                isDark ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-400 to-transparent" : "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-transparent"
            )} />

            <h3 className={cn( "text-sm font-semibold mb-4 self-start flex items-center gap-2", isDark ? "text-slate-200" : "text-slate-800" )}>
                <Network size={16} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                Service Architecture
            </h3>

            <div className="grid grid-cols-3 grid-rows-2 gap-x-4 gap-y-6 w-full max-w-2xl relative isolate pt-2">

                {/* Draw loose SVG lines for connections - simplified for UI flair */}
                <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none stroke-current" style={{ color: isDark ? '#334155' : '#cbd5e1' }}>
                    {/* Abstract lines between grid sections */}
                    <line x1="16%" y1="75%" x2="50%" y2="75%" strokeWidth="2" strokeDasharray="4 4" className={activeServices.has( 'Payment Service' ) ? "opacity-100 animate-pulse" : "opacity-40"} />
                    <line x1="50%" y1="75%" x2="50%" y2="25%" strokeWidth="2" strokeDasharray="4 4" className={activeServices.has( 'Fraud Service' ) ? "opacity-100 animate-pulse" : "opacity-40"} />
                    <line x1="50%" y1="75%" x2="84%" y2="75%" strokeWidth="2" strokeDasharray="4 4" className={activeServices.has( 'Settlement Service' ) ? "opacity-100 animate-pulse" : "opacity-40"} />
                    <line x1="50%" y1="75%" x2="84%" y2="25%" strokeWidth="2" strokeDasharray="4 4" className={activeServices.has( 'Notification Service' ) ? "opacity-100 animate-pulse" : "opacity-40"} />
                </svg>

                {SERVICES.map( service => {
                    const Icon = service.icon;
                    const isPulsing = pulseService === service.id;
                    const isActive = activeServices.has( service.id as ServiceType );

                    return (
                        <div
                            key={service.id}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl border relative transition-all duration-300",
                                service.pos,
                                isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200",
                                isActive && !isPulsing && ( isDark ? "border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-indigo-300 shadow-sm" ),
                                isPulsing && ( isDark ? "border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-105" : "border-emerald-500 shadow-md scale-105" )
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors",

                                isPulsing ? ( isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600" ) :
                                    isActive ? ( isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600" ) :
                                        ( isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400" )
                            )}>
                                <Icon size={16} />
                            </div>
                            <span className={cn(
                                "text-[10px] sm:text-xs font-semibold text-center leading-tight mt-1",
                                isPulsing ? ( isDark ? "text-emerald-400" : "text-emerald-700" ) :
                                    isActive ? ( isDark ? "text-indigo-300" : "text-indigo-700" ) :
                                        ( isDark ? "text-slate-500" : "text-slate-500" )
                            )}>
                                {service.label}
                            </span>

                            {/* Ping indicator */}
                            {isPulsing && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                            )}
                        </div>
                    );
                } )}
            </div>

            <div className={cn( "absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono", isDark ? "text-slate-600" : "text-slate-400" )}>
                <span>Processing Engine v2.4.1</span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    All Systems Operational
                </span>
            </div>
        </div>
    );
}
