'use client';

import { PartnerApiKey } from '@/lib/types';
import { generateApiKey, revokeApiKey } from '@/app/partner-portal/[id]/actions';
import { useTransition, useState } from 'react';
import { Key, Copy, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/status-badge';

export default function ApiKeysManager( { partnerId, apiKeys }: { partnerId: string, apiKeys: PartnerApiKey[] } ) {
    const [isPending, startTransition] = useTransition();
    const [copiedId, setCopiedId] = useState<string | null>( null );

    const onGenerate = () => {
        startTransition( () => {
            generateApiKey( partnerId );
        } );
    };

    const onRevoke = ( keyId: string ) => {
        if ( confirm( "Are you sure you want to revoke this key? Any connected integration using it will immediately fail." ) ) {
            startTransition( () => {
                revokeApiKey( keyId, partnerId );
            } );
        }
    };

    const onCopy = ( id: string, value: string ) => {
        navigator.clipboard.writeText( value );
        setCopiedId( id );
        setTimeout( () => setCopiedId( null ), 2000 );
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Key size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">API Keys</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Manage API keys used for authentication</p>
                    </div>
                </div>
                <button
                    onClick={onGenerate}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <Plus size={16} />
                    Generate Key
                </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 flex-1 overflow-y-auto min-h-[300px]">
                {apiKeys.length === 0 && (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                        No API keys generated yet.
                    </div>
                )}
                {apiKeys.map( k => (
                    <div key={k.id} className={cn( "p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors", k.status === 'revoked' && "bg-slate-50 dark:bg-slate-800/20" )}>
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center justify-between md:justify-start gap-4">
                                <span className={cn( "font-mono text-sm px-3 py-1.5 rounded-md border", k.status === 'revoked' ? "text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" : "text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" )}>
                                    {k.keyValue.slice( 0, 12 )}...{k.keyValue.slice( -4 )}
                                </span>
                                <StatusBadge status={k.status} />
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-xs text-slate-500 dark:text-slate-400">
                                <span>Created: {new Date( k.createdAt ).toLocaleDateString()}</span>
                                <span>Last used: {k.lastUsedAt ? new Date( k.lastUsedAt ).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>

                        {k.status === 'active' && (
                            <div className="flex items-center gap-2 self-start md:self-auto">
                                <button
                                    onClick={() => onCopy( k.id, k.keyValue )}
                                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                    title="Copy Secret Key"
                                >
                                    {copiedId === k.id ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                </button>
                                <button
                                    onClick={() => onRevoke( k.id )}
                                    disabled={isPending}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                    title="Revoke Key"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                ) )}
            </div>
        </div>
    );
}
