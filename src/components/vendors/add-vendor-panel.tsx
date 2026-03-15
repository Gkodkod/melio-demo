'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Loader2 } from 'lucide-react';
import { PaymentMethod } from '@/lib/types';

export default function AddVendorPanel() {
    const [isOpen, setIsOpen] = useState( false );
    const [isSubmitting, setIsSubmitting] = useState( false );
    const [error, setError] = useState<string | null>( null );
    const router = useRouter();

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>( 'ach' );

    const handleSubmit = async ( e: React.FormEvent<HTMLFormElement> ) => {
        e.preventDefault();
        setIsSubmitting( true );
        setError( null );

        const formData = new FormData( e.currentTarget );
        const payload = Object.fromEntries( formData.entries() );

        try {
            const res = await fetch( '/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( payload ),
            } );

            if ( !res.ok ) {
                const data = await res.json();
                throw new Error( data.error || 'Failed to add vendor' );
            }

            setIsOpen( false );
            router.refresh(); // Refresh the vendors table
        } catch ( err: any ) {
            setError( err.message || 'An unexpected error occurred' );
        } finally {
            setIsSubmitting( false );
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    setIsOpen( true );
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
            >
                <Plus size={16} />
                Add Vendor
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen( false )}
                    />

                    {/* Panel */}
                    <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col transform transition-transform duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white">Add New Vendor</h2>
                            <button
                                type="button"
                                onClick={() => setIsOpen( false )}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="add-vendor-form" onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Company Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Acme Corp"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="billing@acmecorp.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        required
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Address
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        id="address"
                                        name="address"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="123 Main St, City, ST 12345"
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-800">
                                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Payment Method
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        name="paymentMethod"
                                        value={paymentMethod}
                                        onChange={( e ) => setPaymentMethod( e.target.value as PaymentMethod )}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                                    >
                                        <option value="ach">ACH Bank Transfer</option>
                                        <option value="card">Credit/Debit Card</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="bankName" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Bank Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="bankName"
                                        name="bankName"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        placeholder="Chase Bank"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="accountLast4" className="block text-sm font-medium text-slate-300 mb-1.5">
                                            Account Last 4
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            id="accountLast4"
                                            name="accountLast4"
                                            maxLength={4}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="1234"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="routingNumber" className="block text-sm font-medium text-slate-300 mb-1.5">
                                            Routing Number
                                        </label>
                                        <input
                                            type="text"
                                            id="routingNumber"
                                            name="routingNumber"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            placeholder="000000000"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen( false )}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="add-vendor-form"
                                    disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Vendor'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
