'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

interface ApiLog {
    id: string;
    endpoint: string;
    method: string;
    statusCode: number;
    latencyMs: number;
    requestPayload: Record<string, any> | null;
    responsePayload: Record<string, any> | null;
    createdAt: string;
}

export default function ApiLogs() {
    const [logs, setLogs] = useState<ApiLog[]>( [] );
    const [loading, setLoading] = useState( true );
    const [expanded, setExpanded] = useState<Record<string, boolean>>( {} );
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect( () => {
        fetchLogs();
        const interval = setInterval( fetchLogs, 5000 ); // polls every 5s
        return () => clearInterval( interval );
    }, [] );

    const fetchLogs = async () => {
        try {
            const res = await fetch( '/api/dev/logs' );
            const data = await res.json();
            if ( Array.isArray( data ) ) setLogs( data );
        } catch ( e ) {
            console.error( 'Failed to fetch logs', e );
        } finally {
            setLoading( false );
        }
    };

    const toggleRow = ( id: string ) => {
        setExpanded( prev => ( { ...prev, [id]: !prev[id] } ) );
    };

    if ( loading && logs.length === 0 ) {
        return <div className="p-8 text-center text-slate-500">Loading logs...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">API Logs</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        History of requests made to your mock API.
                    </p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    title="Refresh logs"
                >
                    <Activity size={18} />
                </button>
            </div>

            <div className={cn(
                "rounded-lg border overflow-hidden text-sm",
                isDark ? "border-slate-800" : "border-slate-200"
            )}>
                <div className={cn(
                    "grid grid-cols-12 gap-4 px-4 py-3 font-medium border-b",
                    isDark ? "bg-slate-800/50 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                )}>
                    <div className="col-span-1"></div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-3">Endpoint</div>
                    <div className="col-span-3">Time</div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800/50">
                    {logs.map( ( log ) => (
                        <div key={log.id} className={cn( "transition-colors", isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50" )}>
                            <div
                                className="grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer"
                                onClick={() => toggleRow( log.id )}
                            >
                                <div className="col-span-1 text-slate-400">
                                    {expanded[log.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </div>
                                <div className="col-span-3 flex items-center gap-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider",
                                        log.statusCode >= 200 && log.statusCode < 300 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                            log.statusCode >= 400 ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" :
                                                "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                                    )}>
                                        {log.statusCode}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">{log.latencyMs}ms</span>
                                </div>
                                <div className="col-span-2 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    {log.method}
                                </div>
                                <div className="col-span-3 font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                                    {log.endpoint}
                                </div>
                                <div className="col-span-3 text-xs text-slate-500 dark:text-slate-400">
                                    {format( new Date( log.createdAt ), 'MMM d, HH:mm:ss' )}
                                </div>
                            </div>

                            {expanded[log.id] && (
                                <div className={cn(
                                    "px-10 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4 border-t",
                                    isDark ? "bg-[#0d1117] border-slate-800" : "bg-[#f6f8fa] border-slate-200"
                                )}>
                                    <div>
                                        <p className="text-xs font-medium mb-2 text-slate-500">Request Body</p>
                                        <pre className={cn(
                                            "p-3 rounded-lg text-[11px] font-mono overflow-auto max-h-[300px]",
                                            isDark ? "bg-[#161b22] text-emerald-400 border border-slate-800" : "bg-white text-emerald-600 border border-slate-300"
                                        )}>
                                            {log.requestPayload ? JSON.stringify( log.requestPayload, null, 2 ) : 'No request body'}
                                        </pre>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium mb-2 text-slate-500">Response Body</p>
                                        <pre className={cn(
                                            "p-3 rounded-lg text-[11px] font-mono overflow-auto max-h-[300px]",
                                            isDark ? "bg-[#161b22] text-[#a5d6ff] border border-slate-800" : "bg-white text-blue-600 border border-slate-300"
                                        )}>
                                            {log.responsePayload ? JSON.stringify( log.responsePayload, null, 2 ) : 'No response body'}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) )}
                    {logs.length === 0 && !loading && (
                        <div className="px-4 py-8 text-center text-slate-500">
                            No API requests found. Try creating a payment mock first.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
