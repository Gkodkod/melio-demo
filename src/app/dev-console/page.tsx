'use client';

import { useState } from 'react';
import { Terminal, Key, Activity, Webhook, FileJson } from 'lucide-react';
import ApiKeys from './api-keys';
import CreatePayment from './create-payment';
import ApiLogs from './api-logs';
import WebhookSimulator from './webhook-simulator';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

type TabId = 'keys' | 'payment_api' | 'logs' | 'webhooks';

export default function DevConsolePage() {
    const [activeTab, setActiveTab] = useState<TabId>( 'keys' );
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const tabs = [
        { id: 'keys', label: 'API Keys', icon: Key },
        { id: 'payment_api', label: 'Create Payment Mock', icon: FileJson },
        { id: 'logs', label: 'API Logs', icon: Activity },
        { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    ] as const;

    return (
        <div className="flex-1 overflow-auto flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className={cn(
                "border-b px-8 py-6 mb-8",
                isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
            )}>
                <div className="flex flex-col gap-2 max-w-6xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-8 h-8 text-indigo-500" />
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Developer Console
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                        Test API functionality, manage mock keys, and simulate webhook events.
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 px-8 pb-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                    {/* Sidebar Nav */}
                    <nav className="flex flex-col gap-1 w-full md:w-64 shrink-0">
                        {tabs.map( ( tab ) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab( tab.id )}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left",
                                        isActive
                                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                                    )}
                                >
                                    <Icon size={18} className={cn( isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-500" )} />
                                    {tab.label}
                                </button>
                            );
                        } )}
                    </nav>

                    {/* Main Content Area */}
                    <main className={cn(
                        "flex-1 rounded-xl shadow-sm border p-6 min-h-[600px]",
                        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    )}>
                        {activeTab === 'keys' && <ApiKeys />}
                        {activeTab === 'payment_api' && <CreatePayment />}
                        {activeTab === 'logs' && <ApiLogs />}
                        {activeTab === 'webhooks' && <WebhookSimulator />}
                    </main>
                </div>
            </div>
        </div>
    );
}
