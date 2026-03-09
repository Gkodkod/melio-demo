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
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Vendors', href: '/vendors', icon: Users },
    { label: 'Invoices', href: '/invoices', icon: FileText },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    { label: 'Transactions', href: '/transactions', icon: Activity },
    { label: 'Reconciliation', href: '/reconciliation', icon: Scale },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState( false );

    const isActive = ( href: string ) => {
        if ( href === '/' ) return pathname === '/';
        return pathname.startsWith( href );
    };

    return (
        <>
            {/* Mobile toggle */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white p-2 rounded-lg shadow-lg"
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
                    'fixed top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:translate-x-0',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700/50">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-sm">
                        M
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Melio</h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">
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
                                    ? 'bg-indigo-600/20 text-indigo-300 shadow-sm shadow-indigo-500/10'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            )}
                        >
                            <Icon size={18} />
                            {label}
                            {isActive( href ) && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            )}
                        </Link>
                    ) )}
                </nav>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold">
                            JD
                        </div>
                        <div>
                            <p className="text-sm font-medium">Jane Doe</p>
                            <p className="text-[11px] text-slate-500">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
