'use client';

/* eslint-disable @next/next/no-img-element */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
    CreditCard,
    Plus,
    Search,
    Calendar,
    Loader2,
    ChevronDown
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import DataTable, { DataTableColumn } from '@/components/data-table';
import StatusBadge from '@/components/status-badge';
import PageHeader from '@/components/page-header';
import PaymentTimeline from '@/components/payment-timeline';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment, Vendor, Invoice } from '@/lib/types';


export default function PaymentsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState( '' );
    const [filterStatus, setFilterStatus] = useState<string>( 'all' );
    const [showCreateModal, setShowCreateModal] = useState( false );
    const [showDetailModal, setShowDetailModal] = useState<Payment | null>( null );
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState( false );
    const [previewMode, setPreviewMode] = useState( false );
    const [countdown, setCountdown] = useState( 30 );
    const currencyDropdownRef = useRef<HTMLDivElement>( null );

    const supportedCurrencies = [
        { code: 'USD', flag: 'us' },
        { code: 'EUR', flag: 'eu' },
        { code: 'GBP', flag: 'gb' },
        { code: 'CAD', flag: 'ca' },
        { code: 'AUD', flag: 'au' },
        { code: 'SGD', flag: 'sg' },
        { code: 'MXN', flag: 'mx' },
        { code: 'ILS', flag: 'il' },
        { code: 'HKD', flag: 'hk' },
        { code: 'SEK', flag: 'se' },
        { code: 'KRW', flag: 'kr' },
        { code: 'CNY', flag: 'cn' },
        { code: 'PLN', flag: 'pl' }
    ];

    const today = new Date().toISOString().split( 'T' )[0];
    const [createForm, setCreateForm] = useState( {
        vendorId: '',
        invoiceId: '',
        currency: 'USD',
        amount: '',
        paymentMethod: 'ach',
        scheduledDate: today
    } );
    const [isSubmitting, setIsSubmitting] = useState( false );
    const [submitError, setSubmitError] = useState( '' );

    const { data: payments = [], isLoading } = useQuery<Payment[]>( {
        queryKey: ['payments'],
        queryFn: () => fetch( '/api/payments' ).then( ( r ) => r.json() ),
    } );

    const { data: vendors = [] } = useQuery<Vendor[]>( {
        queryKey: ['vendors'],
        queryFn: () => fetch( '/api/vendors' ).then( ( r ) => r.json() ),
    } );

    const { data: invoices = [] } = useQuery<Invoice[]>( {
        queryKey: ['invoices'],
        queryFn: () => fetch( '/api/invoices' ).then( ( r ) => r.json() ),
    } );

    const { data: fxData, isFetching: isFetchingFx } = useQuery<{ rate?: number; marketRate?: number; platformRate?: number; spreadPercentage?: number; timestamp: string }>( {
        queryKey: ['fx-rate', createForm.currency],
        queryFn: async () => {
            const res = await fetch( `/api/fx-rate?base=USD&target=${createForm.currency}` );
            if ( !res.ok ) throw new Error( 'Failed to fetch FX rate' );
            return res.json();
        },
        enabled: createForm.currency !== 'USD' && showCreateModal,
        staleTime: 5 * 60 * 1000,
    } );

    useEffect( () => {
        if ( createForm.invoiceId ) {
            const inv = invoices.find( i => i.id === createForm.invoiceId );
            if ( inv ) {
                setCreateForm( prev => ( !prev.amount || parseFloat( prev.amount ) === inv.amount ? { ...prev, amount: inv.amount.toString() } : prev ) );
            }
        }
    }, [createForm.invoiceId, invoices] );

    useEffect( () => {
        if ( !previewMode || countdown <= 0 ) return;
        const timer = setInterval( () => setCountdown( c => c - 1 ), 1000 );
        return () => clearInterval( timer );
    }, [previewMode, countdown] );

    useEffect( () => {
        function handleClickOutside( event: MouseEvent ) {
            if ( currencyDropdownRef.current && !currencyDropdownRef.current.contains( event.target as Node ) ) {
                setShowCurrencyDropdown( false );
            }
        }
        document.addEventListener( "mousedown", handleClickOutside );
        return () => document.removeEventListener( "mousedown", handleClickOutside );
    }, [] );

    const handleContinue = () => {
        setSubmitError( '' );
        if ( !createForm.vendorId || !createForm.invoiceId || !createForm.amount || !createForm.scheduledDate ) {
            setSubmitError( 'Please fill out all required fields' );
            return;
        }

        if ( createForm.currency !== 'USD' ) {
            setPreviewMode( true );
            setCountdown( 30 );
        } else {
            handleCreatePayment();
        }
    };

    const handleCreatePayment = async () => {
        setIsSubmitting( true );
        try {
            const isForeign = createForm.currency !== 'USD';
            if ( isForeign && !fxData ) throw new Error( 'FX rate is still loading, please wait.' );

            const amountNum = parseFloat( createForm.amount );
            // Use the new platformRate if available, otherwise fallback to rate (from previous implementation)
            const marketRate = fxData?.marketRate || fxData?.rate || 1;
            const platformRate = fxData?.platformRate || marketRate;

            const usdAmount = isForeign ? amountNum / platformRate : amountNum;
            const transferFeeAmount = isForeign ? 20 : 0;
            const totalDebit = usdAmount + transferFeeAmount;

            const fxFeeAmount = isForeign ? ( amountNum / marketRate ) - usdAmount : 0;
            const fxSpread = fxData?.spreadPercentage || 0;

            const response = await fetch( '/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( {
                    vendorId: createForm.vendorId,
                    invoiceId: createForm.invoiceId,
                    amount: totalDebit,
                    paymentMethod: createForm.paymentMethod,
                    scheduledDate: createForm.scheduledDate,
                    vendorCurrency: isForeign ? createForm.currency : undefined,
                    usdAmount: isForeign ? usdAmount : undefined,
                    foreignAmount: isForeign ? amountNum : undefined,
                    fxRate: isForeign ? platformRate : undefined,
                    fxTimestamp: isForeign ? fxData?.timestamp : undefined,
                    marketFxRate: isForeign ? marketRate : undefined,
                    fxSpread: isForeign ? fxSpread : undefined,
                    fxFeeAmount: isForeign ? fxFeeAmount : undefined,
                    transferFeeAmount: isForeign ? transferFeeAmount : undefined,
                } ),
            } );

            if ( !response.ok ) {
                const res = await response.json();
                throw new Error( res.error || 'Failed to create payment' );
            }

            // Success
            queryClient.invalidateQueries( { queryKey: ['payments'] } );
            setShowCreateModal( false );
            setPreviewMode( false );
            setCreateForm( { vendorId: '', invoiceId: '', currency: 'USD', amount: '', paymentMethod: 'ach', scheduledDate: today } );
        } catch ( err: unknown ) {
            setSubmitError( err instanceof Error ? err.message : String( err ) );
            if ( previewMode ) setPreviewMode( false );
        } finally {
            setIsSubmitting( false );
        }
    };

    const filtered = payments.filter( ( p ) => {
        const matchesSearch =
            p.vendorName.toLowerCase().includes( search.toLowerCase() ) ||
            p.invoiceNumber.toLowerCase().includes( search.toLowerCase() );
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    } );

    const columns: DataTableColumn<Payment>[] = [
        {
            key: 'payment',
            header: 'Payment',
            sortValue: ( p ) => p.vendorName,
            render: ( p ) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center text-violet-400">
                        <CreditCard size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-white">{p.id}</p>
                        <p className="text-xs text-slate-500">{p.vendorName}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'invoice',
            header: 'Invoice',
            render: ( p ) => <span className="text-slate-300 font-mono text-xs">{p.invoiceNumber}</span>,
        },
        {
            key: 'amount',
            header: 'Amount',
            sortValue: ( p ) => p.amount,
            render: ( p ) => (
                <span className="font-semibold text-white">{formatCurrency( p.amount )}</span>
            ),
        },
        {
            key: 'method',
            header: 'Method',
            sortValue: ( p ) => p.paymentMethod,
            render: ( p ) => (
                <span className="uppercase text-xs font-semibold tracking-wider text-slate-400">
                    {p.paymentMethod}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortValue: ( p ) => p.status,
            render: ( p ) => <StatusBadge status={p.status} />,
        },
        {
            key: 'scheduled',
            header: 'Scheduled',
            sortValue: ( p ) => p.scheduledDate,
            render: ( p ) => <span className="text-slate-400">{formatDate( p.scheduledDate )}</span>,
        },
    ];

    const statuses = ['all', 'draft', 'scheduled', 'processing', 'settled', 'failed'];


    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Payments"
                description="Create and manage vendor payments"
                action={
                    <button
                        onClick={() => setShowCreateModal( true )}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus size={16} />
                        Create Payment
                    </button>
                }
            />

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search payments..."
                        value={search}
                        onChange={( e ) => setSearch( e.target.value )}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {statuses.map( ( s ) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus( s )}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${filterStatus === s
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700'
                                }`}
                        >
                            {s}
                        </button>
                    ) )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium animate-pulse">Loading data...</p>
                    </div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filtered}
                    onRowClick={( p ) => setShowDetailModal( p )}
                    emptyMessage="No payments found."
                />
            )}

            {/* Create Payment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal( false )}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={( e ) => e.stopPropagation()}>
                        {!previewMode ? (
                            <>
                                <h2 className="text-xl font-bold text-white mb-2">Create Payment</h2>
                                <p className="text-sm text-slate-400 mb-6">Set up a new vendor payment</p>

                                {submitError && (
                                    <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                        {submitError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Vendor <span className="text-rose-400">*</span></label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            value={createForm.vendorId}
                                            onChange={( e ) => setCreateForm( { ...createForm, vendorId: e.target.value } )}
                                        >
                                            <option value="">Choose a vendor...</option>
                                            {vendors.map( ( v ) => (
                                                <option key={v.id} value={v.id}>{v.name}</option>
                                            ) )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Invoice <span className="text-rose-400">*</span></label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            value={createForm.invoiceId}
                                            onChange={( e ) => setCreateForm( { ...createForm, invoiceId: e.target.value } )}
                                            disabled={!createForm.vendorId}
                                        >
                                            <option value="">Choose an invoice...</option>
                                            {invoices.filter( ( i ) => i.status === 'approved' && ( !createForm.vendorId || i.vendorId === createForm.vendorId ) ).map( ( i ) => (
                                                <option key={i.id} value={i.id}>{i.invoiceNumber} — {formatCurrency( i.amount )}</option>
                                            ) )}
                                        </select>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Currency</label>
                                            <div className="relative" ref={currencyDropdownRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrencyDropdown( !showCurrencyDropdown )}
                                                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:bg-slate-700/50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={`https://flagcdn.com/w20/${supportedCurrencies.find( c => c.code === createForm.currency )?.flag}.png`}
                                                            alt={createForm.currency}
                                                            width={20}
                                                            height={15}
                                                            className="rounded-[2px]"
                                                        />
                                                        <span>{createForm.currency}</span>
                                                    </div>
                                                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
                                                </button>

                                                {showCurrencyDropdown && (
                                                    <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                                                        {supportedCurrencies.map( c => (
                                                            <button
                                                                key={c.code}
                                                                type="button"
                                                                onClick={() => {
                                                                    setCreateForm( { ...createForm, currency: c.code } );
                                                                    setShowCurrencyDropdown( false );
                                                                }}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors ${createForm.currency === c.code ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300'}`}
                                                            >
                                                                <Image
                                                                    src={`https://flagcdn.com/w20/${c.flag}.png`}
                                                                    alt={c.code}
                                                                    width={20}
                                                                    height={15}
                                                                    className="rounded-[2px]"
                                                                />
                                                                {c.code}
                                                            </button>
                                                        ) )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount <span className="text-rose-400">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    value={createForm.amount}
                                                    onChange={( e ) => setCreateForm( { ...createForm, amount: e.target.value } )}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {createForm.currency !== 'USD' && (
                                        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">Vendor receives</span>
                                                <span className="font-medium text-white">
                                                    {createForm.amount ? `${formatCurrency( parseFloat( createForm.amount ), createForm.currency )} ${createForm.currency}` : `0.00 ${createForm.currency}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400">You pay (USD)</span>
                                                <span className="font-semibold text-white">
                                                    {isFetchingFx ? <Loader2 size={14} className="animate-spin text-indigo-400" /> :
                                                        ( createForm.amount && fxData ? formatCurrency( parseFloat( createForm.amount ) / ( fxData.platformRate || fxData.rate || 1 ) ) : '$0.00' )
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-700/50">
                                                <span className="text-slate-500">Exchange rate</span>
                                                <span className="text-slate-400">
                                                    {fxData ? `1 ${createForm.currency} = ${( 1 / ( fxData.platformRate || fxData.rate || 1 ) ).toFixed( 5 )} USD` : 'Loading...'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1 text-right italic relative group cursor-help">
                                                Exchange rates are cached daily relative to GMT and locked on creation.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Schedule Date <span className="text-rose-400">*</span></label>
                                            <div className="relative">
                                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                                <input
                                                    type="date"
                                                    min={today}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [color-scheme:dark]"
                                                    value={createForm.scheduledDate}
                                                    onChange={( e ) => setCreateForm( { ...createForm, scheduledDate: e.target.value } )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Method</label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCreateForm( { ...createForm, paymentMethod: 'ach' } )}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl ring-1 text-sm font-semibold transition-all ${createForm.paymentMethod === 'ach'
                                                    ? 'bg-indigo-600/10 text-indigo-400 ring-indigo-500/30'
                                                    : 'bg-slate-800 text-slate-400 ring-slate-700 hover:ring-indigo-500/30'
                                                    }`}
                                            >
                                                <CreditCard size={16} /> ACH
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCreateForm( { ...createForm, paymentMethod: 'card' } )}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl ring-1 text-sm font-semibold transition-all ${createForm.paymentMethod === 'card'
                                                    ? 'bg-indigo-600/10 text-indigo-400 ring-indigo-500/30'
                                                    : 'bg-slate-800 text-slate-400 ring-slate-700 hover:ring-indigo-500/30'
                                                    }`}
                                            >
                                                <CreditCard size={16} /> Card
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowCreateModal( false )}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleContinue}
                                        disabled={isSubmitting}
                                        className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : ( createForm.currency !== 'USD' ? 'Continue' : 'Create Payment' )}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-white mb-2">Payment Summary</h2>
                                <p className="text-sm text-slate-400 mb-6">Review your international transfer details</p>

                                {submitError && (
                                    <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                        {submitError}
                                    </div>
                                )}

                                <div className="p-5 rounded-xl border border-indigo-500/30 bg-slate-800/50 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Invoice Amount</span>
                                        <span className="font-semibold text-white">
                                            {formatCurrency( parseFloat( createForm.amount ), createForm.currency )} {createForm.currency}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Exchange Rate</span>
                                        <span className="font-mono text-white">
                                            1 USD = {( fxData?.platformRate || fxData?.rate || 1 ).toFixed( 4 )} {createForm.currency}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Transfer Fee</span>
                                        <span className="text-white">$20.00</span>
                                    </div>
                                    {fxData?.spreadPercentage && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">FX Margin</span>
                                            <span className="text-slate-500">{( ( fxData.spreadPercentage || 0 ) * 100 ).toFixed( 1 )}%</span>
                                        </div>
                                    )}
                                    <div className="pt-4 mt-2 border-t border-slate-700/50 flex justify-between items-center">
                                        <span className="font-semibold text-slate-300">Total Debit</span>
                                        <span className="text-xl font-bold text-indigo-400">
                                            {formatCurrency( parseFloat( createForm.amount ) / ( fxData?.platformRate || fxData?.rate || 1 ) + 20 )}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${countdown > 10 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        <Loader2 size={14} className={countdown > 0 ? "animate-spin" : ""} />
                                        {countdown > 0 ? `Rate locked for ${countdown}s` : 'Rate expired'}
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setPreviewMode( false )}
                                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCreatePayment}
                                        disabled={isSubmitting || countdown <= 0}
                                        className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Payment'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Detail Modal with Lifecycle */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal( null )}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={( e ) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-1">{showDetailModal.id}</h2>
                        <p className="text-sm text-slate-400 mb-6">{showDetailModal.vendorName}</p>

                        {/* Payment Timeline */}
                        <div className="mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <PaymentTimeline payment={showDetailModal} />
                        </div>

                        <div className="glass-card rounded-xl p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Amount</span>
                                <span className="text-white font-semibold">
                                    {formatCurrency( showDetailModal.amount )}
                                </span>
                            </div>

                            {showDetailModal.vendorCurrency && showDetailModal.vendorCurrency !== 'USD' && (
                                <div className="border-y border-slate-700/50 py-3 my-3 space-y-2 bg-slate-800/20 -mx-4 px-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Vendor receives</span>
                                        <span className="text-white font-medium">
                                            {formatCurrency( showDetailModal.foreignAmount || 0, showDetailModal.vendorCurrency )} {showDetailModal.vendorCurrency}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Exchange rate used</span>
                                        <span className="text-slate-400">
                                            {showDetailModal.fxRate ? `1 ${showDetailModal.vendorCurrency} = ${( 1 / showDetailModal.fxRate ).toFixed( 5 )} USD` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-[10px]">
                                        <span className="text-slate-500">Rate locked at</span>
                                        <span className="text-slate-500 text-right">
                                            {showDetailModal.fxTimestamp ? new Date( showDetailModal.fxTimestamp ).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                    {showDetailModal.transferFeeAmount ? (
                                        <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-700/50">
                                            <span className="text-slate-500">Transfer Fee</span>
                                            <span className="text-slate-400">
                                                {formatCurrency( showDetailModal.transferFeeAmount )}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Method</span>
                                <span className="text-white uppercase">{showDetailModal.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Invoice</span>
                                <span className="text-white font-mono text-xs">{showDetailModal.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Scheduled</span>
                                <span className="text-white">{formatDate( showDetailModal.scheduledDate )}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Status</span>
                                <StatusBadge status={showDetailModal.status} />
                            </div>
                        </div>

                        <button
                            onClick={() => setShowDetailModal( null )}
                            className="w-full mt-6 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
