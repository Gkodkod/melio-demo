'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    Activity,
    Scale,
    ShieldAlert,
    Terminal,
    Menu,
    X,
    Sun,
    Moon,
    Network,
    Radio,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Vendors', href: '/vendors', icon: Users },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Transactions', href: '/transactions', icon: Activity },
    { label: 'Reconciliation', href: '/reconciliation', icon: Scale },
    { label: 'Fraud Monitor', href: '/fraud-monitor', icon: ShieldAlert },
    { label: 'Dev Console', href: '/dev-console', icon: Terminal },
    { label: 'Partner Portal', href: '/partner-portal', icon: Network },
    { label: 'System Events', href: '/system-events', icon: Radio },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState( false );
    const { theme, toggleTheme } = useTheme();

    const isActive = ( href: string ) => {
        if ( href === '/' ) return pathname === '/';
        return pathname.startsWith( href );
    };

    const isDark = theme === 'dark';

    return (
        <>
            {/* Mobile toggle */}
            <button
                className={cn(
                    'fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg shadow-lg',
                    isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800 border border-slate-200'
                )}
                onClick={() => setMobileOpen( !mobileOpen )}
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setMobileOpen( false )}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen w-64 flex flex-col transition-all duration-300 lg:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full',
                    isDark
                        ? 'bg-slate-900 text-white border-r border-slate-800'
                        : 'bg-white text-slate-800 border-r border-slate-200 shadow-sm'
                )}
            >
                {/* Logo */}
                <div className={cn(
                    'flex items-center gap-3 px-6 py-6 border-b',
                    isDark ? 'border-slate-700/50' : 'border-slate-200'
                )}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-sm text-white">
                        M
                    </div>
                    <div>
                        <h1 className={cn( 'text-lg font-bold tracking-tight', isDark ? 'text-white' : 'text-slate-900' )}>
                            Gal's Melio-Demo
                        </h1>
                        <p className={cn( 'text-[10px] uppercase tracking-widest', isDark ? 'text-slate-400' : 'text-slate-500' )}>
                            Payments Platform
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map( ( { label, href, icon: Icon } ) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen( false )}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive( href )
                                    ? isDark
                                        ? 'bg-indigo-600/20 text-indigo-300 shadow-sm shadow-indigo-500/10'
                                        : 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-500/5'
                                    : isDark
                                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            )}
                        >
                            <Icon size={18} />
                            {label}
                            {isActive( href ) && (
                                <div className={cn(
                                    'ml-auto w-1.5 h-1.5 rounded-full',
                                    isDark ? 'bg-indigo-400' : 'bg-indigo-500'
                                )} />
                            )}
                        </Link>
                    ) )}
                </nav>

                {/* Theme Toggle + Footer */}
                <div className={cn( 'px-4 py-3 border-t', isDark ? 'border-slate-700/50' : 'border-slate-200' )}>
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                            isDark
                                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        )}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        {isDark ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>

                <div className={cn( 'px-6 py-4 border-t', isDark ? 'border-slate-700/50' : 'border-slate-200' )}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                            GL
                        </div>
                        <div>
                            <p className={cn( 'text-sm font-medium', isDark ? 'text-white' : 'text-slate-900' )}>
                                Gal Levinshtein
                            </p>
                            <p className={cn( 'text-[11px]', isDark ? 'text-slate-500' : 'text-slate-400' )}>
                                Admin
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
