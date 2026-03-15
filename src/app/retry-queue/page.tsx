'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, AlertCircle, CheckCircle2, XCircle, RefreshCw, Send, Activity, Settings2 } from 'lucide-react';

interface RetryQueueItem {
    id: string;
    paymentId: string;
    errorMessage: string;
    retryAttempts: number;
    nextRetryAt: string;
    backoffPolicy: string;
    status: 'pending' | 'processing' | 'resolved' | 'failed';
    createdAt: string;
    updatedAt: string;
}

export default function RetryQueuePage() {
    const [items, setItems] = useState<RetryQueueItem[]>( [] );
    const [loading, setLoading] = useState( true );
    const [actionLoading, setActionLoading] = useState( false );

    const fetchQueue = async () => {
        try {
            setLoading( true );
            const res = await fetch( '/api/dev/retry-queue' );
            if ( res.ok ) {
                const data = await res.json();
                setItems( data );
            }
        } catch ( err ) {
            console.error( 'Failed to fetch retry queue', err );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        fetchQueue();
    }, [] );

    const handleAction = async ( action: 'inject' | 'tick' ) => {
        try {
            setActionLoading( true );
            await fetch( '/api/dev/retry-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { action } )
            } );
            await fetchQueue();
        } catch ( err ) {
            console.error( `Action ${action} failed`, err );
        } finally {
            setActionLoading( false );
        }
    };

    const getStatusBadge = ( status: string ) => {
        switch ( status ) {
            case 'pending': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"><Clock size={12} /> Pending</span>;
            case 'processing': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"><RefreshCw size={12} className="animate-spin" /> Processing</span>;
            case 'resolved': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"><CheckCircle2 size={12} /> Resolved</span>;
            case 'failed': return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"><XCircle size={12} /> Failed</span>;
            default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
        }
    };

    const formatTimeAgo = ( dateStr: string ) => {
        const diff = new Date().getTime() - new Date( dateStr ).getTime();
        if ( diff < 0 ) return 'In the future';
        const seconds = Math.floor( diff / 1000 );
        if ( seconds < 60 ) return `${seconds}s ago`;
        const minutes = Math.floor( seconds / 60 );
        if ( minutes < 60 ) return `${minutes}m ago`;
        const hours = Math.floor( minutes / 60 );
        return `${hours}h ago`;
    };

    const formatFutureTime = ( dateStr: string ) => {
        const time = new Date( dateStr ).getTime();
        const now = new Date().getTime();
        const diff = time - now;

        if ( diff <= 0 ) return 'Ready';

        const seconds = Math.floor( diff / 1000 );
        if ( seconds < 60 ) return `in ${seconds}s`;
        const minutes = Math.floor( seconds / 60 );
        return `in ${minutes}m ${seconds % 60}s`;
    };

    const stats = {
        total: items.length,
        pending: items.filter( i => i.status === 'pending' ).length,
        resolved: items.filter( i => i.status === 'resolved' ).length,
        failed: items.filter( i => i.status === 'failed' ).length
    };

    return (
        <div className="min-h-screen p-8 pt-20 lg:pt-8 transition-colors duration-200 flex justify-center">
            <div className="w-full max-w-6xl space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                <Settings2 size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Retry Queue</h1>
                        </div>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Reliability engineering dashboard simulating exponential backoff for failed transactions.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleAction( 'inject' )}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            <AlertCircle size={16} className="text-orange-500" />
                            Inject Failure
                        </button>
                        <button
                            onClick={() => handleAction( 'tick' )}
                            disabled={actionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50"
                        >
                            <Play size={16} />
                            Simulate Tick
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={48} />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Events</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-amber-500 group-hover:opacity-20 transition-opacity">
                            <Clock size={48} />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Retry</p>
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</p>
                    </div>
                    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500 group-hover:opacity-20 transition-opacity">
                            <CheckCircle2 size={48} />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resolved</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolved}</p>
                    </div>
                    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-500 group-hover:opacity-20 transition-opacity">
                            <XCircle size={48} />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Dead Letter (Failed)</p>
                        <p className="text-3xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.failed}</p>
                    </div>
                </div>

                {/* Queue Table */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Active Queue</h2>
                        <button onClick={fetchQueue} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Payment ID</th>
                                    <th className="px-6 py-4 font-medium">Error Details</th>
                                    <th className="px-6 py-4 font-medium">Next Retry</th>
                                    <th className="px-6 py-4 font-medium text-center">Attempts</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <CheckCircle2 size={32} className="text-emerald-500 opacity-50" />
                                                <p>Queue is empty. Everything is running smoothly!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map( ( item ) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                                                        <Send size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white text-sm">{item.paymentId}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{item.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.errorMessage}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{item.backoffPolicy} backoff</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-900 dark:text-white font-medium">
                                                    {item.status === 'pending' ? formatFutureTime( item.nextRetryAt ) : '--'}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Added {formatTimeAgo( item.createdAt )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    {item.retryAttempts}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge( item.status )}
                                            </td>
                                        </tr>
                                    ) )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
