'use client';

import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

interface ApiKey {
    id: string;
    publishableKey: string;
    secretKey: string;
    name: string;
    status: string;
    createdAt: string;
}

export default function ApiKeys() {
    const [keys, setKeys] = useState<ApiKey[]>( [] );
    const [loading, setLoading] = useState( true );
    const [showSecret, setShowSecret] = useState( false );
    const [copiedKey, setCopiedKey] = useState<'pub' | 'sec' | null>( null );
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect( () => {
        fetchKeys();
    }, [] );

    const fetchKeys = async () => {
        try {
            const res = await fetch( '/api/dev/keys' );
            const data = await res.json();
            if ( Array.isArray( data ) ) setKeys( data );
        } catch ( error ) {
            console.error( 'Failed to fetch keys', error );
        } finally {
            setLoading( false );
        }
    };

    const handleCopy = ( text: string, type: 'pub' | 'sec' ) => {
        navigator.clipboard.writeText( text );
        setCopiedKey( type );
        setTimeout( () => setCopiedKey( null ), 2000 );
    };

    const handleRotate = async () => {
        if ( !confirm( 'Are you sure? This will revoke the current active key and generate a new one.' ) ) return;
        setLoading( true );
        try {
            const res = await fetch( '/api/dev/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( { action: 'rotate' } ),
            } );
            const newKey = await res.json();
            if ( newKey.id ) {
                setKeys( [newKey] ); /* Replacing list as the old one is revoked */
                setShowSecret( false );
            }
        } catch ( error ) {
            console.error( 'Failed to rotate key', error );
        } finally {
            setLoading( false );
        }
    };

    if ( loading && keys.length === 0 ) {
        return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div></div></div>;
    }

    const activeKey = keys.find( k => k.status === 'active' );

    if ( !activeKey ) return <p>No active API keys found.</p>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">Standard API Keys</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    These keys will allow you to authenticate API requests.
                </p>
            </div>

            <div className={cn(
                "rounded-lg border overflow-hidden",
                isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
            )}>
                {/* Publishable Key */}
                <div className={cn( "p-4 border-b flex items-center justify-between", isDark ? "border-slate-800" : "border-slate-200" )}>
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Publishable key</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use this key in your client-side code.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <code className={cn(
                            "px-3 py-1.5 rounded text-sm font-mono",
                            isDark ? "bg-slate-800 text-slate-300" : "bg-white border text-slate-700"
                        )}>
                            {activeKey.publishableKey}
                        </code>
                        <button
                            onClick={() => handleCopy( activeKey.publishableKey, 'pub' )}
                            className={cn( "p-2 rounded-md transition-colors", isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-white text-slate-500 shadow-sm" )}
                            title="Copy publishable key"
                        >
                            {copiedKey === 'pub' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Secret Key */}
                <div className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Secret key</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Use this key to authenticate API requests on your server.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <code className={cn(
                            "px-3 py-1.5 rounded text-sm font-mono flex items-center gap-2",
                            isDark ? "bg-slate-800 text-slate-300" : "bg-white border text-slate-700"
                        )}>
                            {showSecret ? activeKey.secretKey : 'sk_test_••••••••••••••••••••••••'}
                        </code>
                        <button
                            onClick={() => setShowSecret( !showSecret )}
                            className={cn( "p-2 rounded-md transition-colors", isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-white text-slate-500 shadow-sm" )}
                            title={showSecret ? "Hide secret key" : "Reveal secret key"}
                        >
                            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                            onClick={() => handleCopy( activeKey.secretKey, 'sec' )}
                            className={cn( "p-2 rounded-md transition-colors", isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-white text-slate-500 shadow-sm" )}
                            title="Copy secret key"
                        >
                            {copiedKey === 'sec' ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleRotate}
                    disabled={loading}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors border",
                        isDark
                            ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    )}
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Rotate Key
                </button>
            </div>
        </div>
    );
}
