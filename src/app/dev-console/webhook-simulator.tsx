'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Webhook, RefreshCw, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

interface WebhookLog {
    id: string;
    eventType: string;
    payload: Record<string, any>;
    status: string;
    deliveryAttempts: number;
    lastAttemptAt: string;
    createdAt: string;
}

export default function WebhookSimulator() {
    const [eventType, setEventType] = useState( 'payment.succeeded' );
    const [logs, setLogs] = useState<WebhookLog[]>( [] );
    const [loading, setLoading] = useState( false );
    const [logsLoading, setLogsLoading] = useState( true );
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const events = [
        'payment.created',
        'payment.processing',
        'payment.succeeded',
        'payment.failed'
    ];

    useEffect( () => {
        fetchLogs();
    }, [] );

    const fetchLogs = async () => {
        try {
            const res = await fetch( '/api/dev/webhooks' );
            const data = await res.json();
            if ( Array.isArray( data ) ) setLogs( data );
        } catch ( e ) {
            console.error( 'Failed to fetch webhook logs', e );
        } finally {
            setLogsLoading( false );
        }
    };

    const handleTrigger = async () => {
        setLoading( true );
        try {
            await fetch( '/api/dev/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { event_type: eventType } ),
            } );
            await fetchLogs(); // refresh logs after triggering
        } catch ( error ) {
            console.error( 'Failed to trigger webhook', error );
        } finally {
            setLoading( false );
        }
    };

    const handleRetry = async ( id: string ) => {
        try {
            await fetch( '/api/dev/webhooks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { id } ),
            } );
            await fetchLogs();
        } catch ( error ) {
            console.error( 'Failed to retry webhook', error );
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trigger Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">Trigger Webhook</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Send a test webhook event to your endpoint.
                    </p>
                </div>

                <div className={cn(
                    "p-5 rounded-xl border space-y-4",
                    isDark ? "bg-[#0d1117] border-slate-800" : "bg-slate-50 border-slate-200"
                )}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Event Type
                        </label>
                        <select
                            value={eventType}
                            onChange={( e ) => setEventType( e.target.value )}
                            className={cn(
                                "w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                            )}
                        >
                            {events.map( ev => <option key={ev} value={ev}>{ev}</option> )}
                        </select>
                    </div>

                    <button
                        onClick={handleTrigger}
                        disabled={loading}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-colors border",
                            isDark
                                ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                                : "bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-sm"
                        )}
                    >
                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                        Send Event
                    </button>
                    <p className="text-[11px] text-slate-500 text-center">
                        Note: Webhook deliveries have a mock 20% failure rate.
                    </p>
                </div>
            </div>

            {/* Logs Panel */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">Delivery Logs</h2>
                    <button
                        onClick={fetchLogs}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                        <RefreshCw size={14} className={logsLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="space-y-3">
                    {logs.map( log => (
                        <div
                            key={log.id}
                            className={cn(
                                "rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors",
                                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={cn(
                                        "px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full",
                                        log.status === 'delivered' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                            log.status === 'pending' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                                "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    )}>
                                        {log.status}
                                    </span>
                                    <h4 className="font-mono text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {log.eventType}
                                    </h4>
                                </div>
                                <div className="flex gap-4 text-xs text-slate-500">
                                    <span className="font-mono">{log.id.split( '_' )[1]}</span>
                                    <span>Attempts: {log.deliveryAttempts}</span>
                                    <span>{format( new Date( log.createdAt ), 'MMM d, HH:mm:ss' )}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {log.status === 'failed' && (
                                    <button
                                        onClick={() => handleRetry( log.id )}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                                            isDark
                                                ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                                                : "border-slate-300 text-slate-700 hover:bg-slate-50"
                                        )}
                                    >
                                        <RefreshCw size={12} />
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    ) )}
                    {logs.length === 0 && !logsLoading && (
                        <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl dark:border-slate-800">
                            <Webhook className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                            <p>No webhook deliveries recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
