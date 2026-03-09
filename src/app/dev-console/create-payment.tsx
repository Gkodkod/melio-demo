'use client';

import { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

export default function CreatePayment() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [loading, setLoading] = useState( false );
    const [apiKey, setApiKey] = useState( '' );

    const [form, setForm] = useState( {
        amount: 5000,
        currency: 'usd',
        vendor_id: 'vend_mock_123',
        payment_method: 'ach',
        description: 'Mock Payment for testing',
    } );

    const [requestJson, setRequestJson] = useState( '' );
    const [responseJson, setResponseJson] = useState( '' );
    const [status, setStatus] = useState<number | null>( null );

    // Fetch the active secret key to use automatically for convenience
    useEffect( () => {
        fetch( '/api/dev/keys' )
            .then( res => res.json() )
            .then( data => {
                if ( Array.isArray( data ) && data.length > 0 ) {
                    const active = data.find( k => k.status === 'active' );
                    if ( active ) setApiKey( active.secretKey );
                }
            } );
    }, [] );

    // Update request JSON display when form changes
    useEffect( () => {
        const reqStr = JSON.stringify( {
            amount: Number( form.amount ),
            currency: form.currency,
            vendor_id: form.vendor_id,
            payment_method: form.payment_method,
            description: form.description
        }, null, 2 );
        setRequestJson( reqStr );
    }, [form] );

    const handleSubmit = async ( e: React.FormEvent ) => {
        e.preventDefault();
        setLoading( true );
        setResponseJson( '' );
        setStatus( null );

        try {
            const res = await fetch( '/api/dev/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: requestJson,
            } );

            const data = await res.json();
            setStatus( res.status );
            setResponseJson( JSON.stringify( data, null, 2 ) );
        } catch ( error: any ) {
            setStatus( 500 );
            setResponseJson( JSON.stringify( { error: error.message }, null, 2 ) );
        } finally {
            setLoading( false );
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Form Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white">Create Payment Mock</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Send a test request to the `/v1/payment_intents` endpoint.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">API Key (Bearer Token)</label>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={( e ) => setApiKey( e.target.value )}
                            className={cn(
                                "w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                            )}
                            placeholder="sk_test_..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Amount (cents)</label>
                            <input
                                type="number"
                                value={form.amount}
                                onChange={( e ) => setForm( { ...form, amount: Number( e.target.value ) } )}
                                className={cn(
                                    "w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                                )}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Currency</label>
                            <select
                                value={form.currency}
                                onChange={( e ) => setForm( { ...form, currency: e.target.value } )}
                                className={cn(
                                    "w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                    isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                                )}
                            >
                                <option value="usd">usd</option>
                                <option value="eur">eur</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Vendor ID</label>
                        <input
                            type="text"
                            value={form.vendor_id}
                            onChange={( e ) => setForm( { ...form, vendor_id: e.target.value } )}
                            className={cn(
                                "w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                            )}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                        <select
                            value={form.payment_method}
                            onChange={( e ) => setForm( { ...form, payment_method: e.target.value } )}
                            className={cn(
                                "w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                            )}
                        >
                            <option value="ach">ACH</option>
                            <option value="card">Card</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Description</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={( e ) => setForm( { ...form, description: e.target.value } )}
                            className={cn(
                                "w-full px-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                                isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                            )}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !apiKey}
                            className={cn(
                                "flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md text-sm font-semibold transition-all",
                                "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                            )}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                            Send Request
                        </button>
                    </div>
                </form>
            </div>

            {/* Code Panel Section */}
            <div className="flex flex-col gap-4">
                <div className="flex-1 min-h-[250px] flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-xl">
                    <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-[#161b22]">
                        <span className="text-xs font-medium text-slate-400">Request JSON</span>
                        <div className="ml-auto flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                        </div>
                    </div>
                    <div className="p-4 overflow-auto flex-1">
                        <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                            {requestJson}
                        </pre>
                    </div>
                </div>

                <div className="flex-1 min-h-[250px] flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-xl">
                    <div className="flex items-center px-4 py-2 border-b border-slate-800 bg-[#161b22]">
                        <span className="text-xs font-medium text-slate-400">Response</span>
                        {status && (
                            <span className={cn(
                                "ml-3 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                                status === 200 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            )}>
                                {status}
                            </span>
                        )}
                    </div>
                    <div className="p-4 overflow-auto flex-1">
                        {responseJson ? (
                            <pre className="text-xs font-mono text-[#a5d6ff] leading-relaxed">
                                {responseJson}
                            </pre>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 text-xs italic font-mono">
                                Awaiting response...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
