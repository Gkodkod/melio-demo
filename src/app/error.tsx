'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error( {
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
} ) {
    useEffect( () => {
        console.error( error );
    }, [error] );

    return (
        <div className="flex items-center justify-center py-20">
            <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                    <p className="text-sm text-slate-400">
                        An error occurred while trying to load this page. Please try again.
                    </p>
                </div>
                <button
                    onClick={() => reset()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 w-full justify-center"
                >
                    <RefreshCcw size={16} />
                    Try again
                </button>
            </div>
        </div>
    );
}
