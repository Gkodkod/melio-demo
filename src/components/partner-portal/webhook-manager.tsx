'use client';

import { WebhookSubscription } from '@/lib/types';
import { addWebhook, removeWebhook, updateWebhookUrl } from '@/app/partner-portal/[id]/actions';
import { useTransition, useState } from 'react';
import { Webhook, Plus, X, Globe } from 'lucide-react';

const AVAILABLE_EVENTS = [
    'payment.created',
    'payment.processing',
    'payment.settled',
    'payment.failed'
];

export default function WebhookManager( {
    partnerId,
    webhookUrl,
    subscriptions
}: {
    partnerId: string,
    webhookUrl: string | null,
    subscriptions: WebhookSubscription[]
} ) {
    const [isPending, startTransition] = useTransition();
    const [url, setUrl] = useState( webhookUrl || '' );
    const [isEditingUrl, setIsEditingUrl] = useState( !webhookUrl );
    const [newEvent, setNewEvent] = useState( AVAILABLE_EVENTS[0] );

    const onAddWebhook = () => {
        if ( !newEvent || subscriptions.some( s => s.eventType === newEvent ) ) return;
        startTransition( () => {
            addWebhook( partnerId, newEvent );
        } );
    };

    const onRemoveWebhook = ( id: string ) => {
        startTransition( () => {
            removeWebhook( id, partnerId );
        } );
    };

    const onSaveUrl = () => {
        startTransition( () => {
            updateWebhookUrl( partnerId, url );
            setIsEditingUrl( false );
        } );
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Webhook size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Webhooks</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Configure endpoint and event subscriptions</p>
                </div>
            </div>

            <div className="p-6 border-b border-slate-100 dark:border-slate-800/50">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe size={16} className="text-slate-400" /> Endpoint URL
                </h4>
                {isEditingUrl ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="url"
                            value={url}
                            onChange={( e ) => setUrl( e.target.value )}
                            placeholder="https://your-api.com/webhooks"
                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                            onClick={onSaveUrl}
                            disabled={isPending || !url}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            Save Endpoint
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">{webhookUrl}</span>
                        <button
                            onClick={() => setIsEditingUrl( true )}
                            className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                        >
                            Edit
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Subscribed Events</h4>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {subscriptions.map( sub => (
                            <div key={sub.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300 transition-colors">
                                {sub.eventType}
                                <button
                                    onClick={() => onRemoveWebhook( sub.id )}
                                    disabled={isPending}
                                    className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) )}
                        {subscriptions.length === 0 && (
                            <span className="text-sm text-slate-500 dark:text-slate-400">No events subscribed.</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50 mt-auto">
                    <select
                        value={newEvent}
                        onChange={( e ) => setNewEvent( e.target.value )}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        {AVAILABLE_EVENTS.map( ev => (
                            <option key={ev} value={ev} disabled={subscriptions.some( s => s.eventType === ev )}>
                                {ev}
                            </option>
                        ) )}
                    </select>
                    <button
                        onClick={onAddWebhook}
                        disabled={isPending || !newEvent || subscriptions.some( s => s.eventType === newEvent )}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <Plus size={16} /> Add Event
                    </button>
                </div>
            </div>
        </div>
    );
}
