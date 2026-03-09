'use client';

import { useState } from 'react';
import {
    CheckCircle2,
    CircleDashed,
    FileText,
    ShieldCheck,
    RefreshCcw,
    Send,
    Globe,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Check
} from 'lucide-react';
import type { Payment } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// Timeline event statuses based on the prompt
// 1. payment.created
// 2. payment.authorized
// 3. payment.processing
// 4. settlement.started
// 5. settlement.completed
// 6. webhook.delivered

type EventStatus = 'completed' | 'current' | 'upcoming' | 'failed';

interface TimelineEvent {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string | null;
    status: EventStatus;
    icon: React.ElementType;
    payload: Record<string, unknown>;
}

const generateMockEvents = ( payment: Payment ): TimelineEvent[] => {
    // We base the dates around the scheduledDate
    const baseDate = new Date( payment.scheduledDate );

    // Create timestamps relative to baseDate
    const createdDate = new Date( baseDate.getTime() - 3 * 24 * 60 * 60 * 1000 ); // 3 days before
    const authorizedDate = new Date( baseDate.getTime() - 2 * 24 * 60 * 60 * 1000 ); // 2 days before
    const processingDate = new Date( baseDate.getTime() - 1 * 60 * 60 * 1000 ); // 1 hr before
    const startedDate = new Date( baseDate.getTime() + 1 * 60 * 60 * 1000 ); // 1 hr after
    const completedDate = new Date( baseDate.getTime() + 2 * 24 * 60 * 60 * 1000 ); // 2 days after
    const webhookDate = new Date( baseDate.getTime() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000 ); // 5 mins after completion

    const isFailed = payment.status === 'failed';

    const events: TimelineEvent[] = [
        {
            id: 'evt_1',
            type: 'payment.created',
            title: 'Payment Created',
            description: 'The payment object was created by the vendor.',
            timestamp: createdDate.toISOString(),
            status: 'completed',
            icon: FileText,
            payload: {
                id: payment.id,
                object: "payment",
                amount: payment.amount,
                currency: "usd",
                status: "draft",
                created_at: createdDate.toISOString()
            }
        },
        {
            id: 'evt_2',
            type: 'payment.authorized',
            title: 'Payment Authorized',
            description: 'Funds and constraints have been verified.',
            timestamp: ['scheduled', 'processing', 'settled', 'failed'].includes( payment.status ) ? authorizedDate.toISOString() : null,
            status: payment.status === 'draft' ? 'upcoming' : 'completed',
            icon: ShieldCheck,
            payload: {
                id: "auth_" + payment.id.split( '_' )[1],
                object: "authorization",
                payment_id: payment.id,
                status: "authorized",
                authorized_at: authorizedDate.toISOString()
            }
        },
        {
            id: 'evt_3',
            type: 'payment.processing',
            title: 'Processing Started',
            description: 'The payment has been sent to the processing network.',
            timestamp: ['processing', 'settled'].includes( payment.status ) || ( isFailed && payment.failureReason?.includes( 'network' ) ) ? processingDate.toISOString() : null,
            status: payment.status === 'scheduled' ? 'current' : ( ['draft'].includes( payment.status ) ? 'upcoming' : ( isFailed ? 'failed' : 'completed' ) ),
            icon: RefreshCcw,
            payload: {
                id: "proc_" + payment.id.split( '_' )[1],
                object: "processing",
                payment_id: payment.id,
                network: payment.paymentMethod.toUpperCase(),
                status: isFailed ? "failed" : "processing",
                processing_at: processingDate.toISOString()
            }
        },
        {
            id: 'evt_4',
            type: 'settlement.started',
            title: 'Settlement Initiated',
            description: 'Funds are being transferred to the destination account.',
            timestamp: payment.status === 'settled' ? startedDate.toISOString() : null,
            status: payment.status === 'processing' ? 'current' : ( ['draft', 'scheduled'].includes( payment.status ) ? 'upcoming' : ( isFailed ? 'upcoming' : 'completed' ) ),
            icon: Send,
            payload: {
                id: "stl_" + payment.id.split( '_' )[1],
                object: "settlement",
                payment_id: payment.id,
                destination: "acct_123456789",
                status: "pending",
                started_at: startedDate.toISOString()
            }
        },
        {
            id: 'evt_5',
            type: 'settlement.completed',
            title: 'Settlement Completed',
            description: 'Funds have successfully reached the destination.',
            timestamp: payment.status === 'settled' ? completedDate.toISOString() : null,
            status: payment.status === 'settled' ? 'completed' : ( isFailed ? 'upcoming' : 'upcoming' ),
            icon: CheckCircle2,
            payload: {
                id: "stl_" + payment.id.split( '_' )[1],
                object: "settlement",
                payment_id: payment.id,
                status: "completed",
                completed_at: completedDate.toISOString()
            }
        },
        {
            id: 'evt_6',
            type: 'webhook.delivered',
            title: 'Webhook Delivered',
            description: 'A webhook was successfully delivered to your endpoint.',
            timestamp: payment.status === 'settled' ? webhookDate.toISOString() : null,
            status: payment.status === 'settled' ? 'completed' : 'upcoming',
            icon: Globe,
            payload: {
                id: "evt_" + payment.id.split( '_' )[1] + "_hook",
                object: "event",
                type: "payment.settled",
                delivery_status: "success",
                delivered_at: webhookDate.toISOString()
            }
        }
    ];

    return events;
};


export default function PaymentTimeline( { payment }: { payment: Payment } ) {
    const events = generateMockEvents( payment );
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>( new Set() );

    const toggleEvent = ( id: string ) => {
        setExpandedEvents( prev => {
            const next = new Set( prev );
            if ( next.has( id ) ) {
                next.delete( id );
            } else {
                next.add( id );
            }
            return next;
        } );
    };

    return (
        <div className="w-full">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                Timeline Events
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                    Live
                </span>
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/50 before:via-slate-700 before:to-transparent">
                {events.map( ( event, index ) => {
                    const isExpanded = expandedEvents.has( event.id );
                    const isLast = index === events.length - 1;

                    let IconColor = "text-slate-400";
                    let IconBg = "bg-slate-800";
                    let IconBorder = "border-slate-700";

                    if ( event.status === 'completed' ) {
                        IconColor = "text-indigo-400";
                        IconBg = "bg-indigo-500/10";
                        IconBorder = "border-indigo-500/30";
                    } else if ( event.status === 'current' ) {
                        IconColor = "text-indigo-300";
                        IconBg = "bg-indigo-600";
                        IconBorder = "border-indigo-400";
                    } else if ( event.status === 'failed' ) {
                        IconColor = "text-red-400";
                        IconBg = "bg-red-500/10";
                        IconBorder = "border-red-500/30";
                    }

                    return (
                        <div key={event.id} className="relative group">
                            {/* Line connecting items */}
                            {!isLast && (
                                <div className={`absolute left-0 top-8 bottom-[-24px] w-0.5 -ml-px ${event.status === 'completed' ? 'bg-indigo-500/30' : 'bg-slate-800'}`} />
                            )}

                            <div className="flex items-start gap-4">
                                {/* Icon container */}
                                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border ${IconBg} ${IconBorder} backdrop-blur-sm -ml-[35px] shrink-0 transition-all duration-300 group-hover:scale-110 shadow-lg`}>
                                    {event.status === 'failed' ? (
                                        <AlertCircle size={14} className={IconColor} />
                                    ) : event.status === 'completed' ? (
                                        <Check size={14} className={IconColor} />
                                    ) : event.status === 'current' ? (
                                        <event.icon size={14} className={`${IconColor} animate-pulse`} />
                                    ) : (
                                        <CircleDashed size={14} className={IconColor} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`flex-1 min-w-0 bg-slate-800/40 rounded-xl border ${event.status === 'current' ? 'border-indigo-500/30 ring-1 ring-indigo-500/20' : 'border-slate-700/50'} p-4 transition-all hover:bg-slate-800/60`}>
                                    <div
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                                        onClick={() => toggleEvent( event.id )}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className={`text-sm font-semibold ${event.status === 'upcoming' ? 'text-slate-500' : 'text-slate-200'}`}>
                                                    {event.title}
                                                </h4>
                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${event.status === 'upcoming' ? 'bg-slate-800 text-slate-500' : 'bg-slate-900/50 text-slate-400 border border-slate-700'}`}>
                                                    {event.type}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-1 ${event.status === 'upcoming' ? 'text-slate-600' : 'text-slate-400'}`}>
                                                {event.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {event.timestamp && (
                                                <time className="text-xs text-slate-500 whitespace-nowrap">
                                                    {formatDate( event.timestamp )}
                                                </time>
                                            )}
                                            <button className="p-1 rounded-md hover:bg-slate-700 text-slate-400 transition-colors">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable JSON Payload */}
                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-slate-700/50 animate-in slide-in-from-top-2 fade-in duration-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Event Payload</span>
                                                <button className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-2 py-1 rounded">
                                                    Copy JSON
                                                </button>
                                            </div>
                                            <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-[11px] font-mono text-slate-300 ring-1 ring-white/5">
                                                <code>{JSON.stringify( event.payload, null, 2 )}</code>
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                } )}
            </div>
        </div>
    );
}
