import { X, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Invoice } from '@/lib/types';

interface Props {
    invoice: Invoice;
    onClose: () => void;
}

export default function InvoicePdfViewer( { invoice, onClose }: Props ) {
    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex flex-col pt-8 pb-12 px-4 overflow-y-auto print:bg-white print:p-0">
            {/* Toolbar (hidden when printing) */}
            <div className="w-full max-w-[210mm] mx-auto flex justify-between items-center mb-6 print:hidden shrink-0">
                <div className="text-white font-medium flex items-center gap-2">
                    Invoice {invoice.invoiceNumber}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                        <Printer size={16} />
                        Print / Save PDF
                    </button>
                    <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors border border-slate-700">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* The A4 "Paper" */}
            <div className="w-full max-w-[210mm] mx-auto min-h-[297mm] bg-white rounded-sm shadow-2xl shrink-0 print:shadow-none print:m-0 text-slate-900 overflow-hidden relative">
                {/* Decorative header bar */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-indigo-600 print:bg-indigo-600 !print:block" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />

                {/* Header */}
                <div className="px-12 pt-16 pb-8 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h1 className="text-5xl font-light text-slate-800 mb-3 tracking-tight">INVOICE</h1>
                        <p className="text-slate-500 font-medium text-lg tracking-wider">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-2xl text-indigo-900 mb-2">Acme Corp Ltd.</div>
                        <div className="text-slate-500 text-sm leading-relaxed">
                            123 Innovation Drive<br />
                            Tech City, TC 90210<br />
                            billing@acmecorp.dev
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="px-12 py-10 flex justify-between items-start bg-slate-50/50 print:bg-transparent">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed To</div>
                        <div className="font-bold text-xl text-indigo-950 mb-1">{invoice.vendorName}</div>
                        <div className="text-slate-500 text-sm leading-relaxed">
                            Payment Dept.<br />
                            Vendor Address Line 1<br />
                            City, State, ZIP
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-right">
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice Date</div>
                            <div className="font-medium text-slate-900">{formatDate( new Date().toISOString() )}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</div>
                            <div className="font-medium text-slate-900">{formatDate( invoice.dueDate )}</div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="px-12 py-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-800 text-slate-800">
                                <th className="pb-4 pt-2 text-sm font-bold uppercase tracking-wider w-1/2">Description</th>
                                <th className="pb-4 pt-2 text-sm font-bold uppercase tracking-wider text-center">Qty</th>
                                <th className="pb-4 pt-2 text-sm font-bold uppercase tracking-wider text-right">Rate</th>
                                <th className="pb-4 pt-2 text-sm font-bold uppercase tracking-wider text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            <tr className="border-b border-slate-100 group">
                                <td className="py-6 pr-4">
                                    <div className="font-bold text-slate-900 mb-1">Services Rendered</div>
                                    <div className="text-sm text-slate-500">{invoice.description || 'Standard consulting services'}</div>
                                </td>
                                <td className="py-6 text-center font-medium">1</td>
                                <td className="py-6 text-right font-medium">{formatCurrency( invoice.amount )}</td>
                                <td className="py-6 text-right font-bold text-slate-900">{formatCurrency( invoice.amount )}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="px-12 py-8 flex justify-end">
                    <div className="w-1/2 max-w-[300px]">
                        <div className="flex justify-between py-3 border-b border-slate-100">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-900">{formatCurrency( invoice.amount )}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-slate-100">
                            <span className="text-slate-500">Tax (0%)</span>
                            <span className="font-medium text-slate-900">{formatCurrency( 0 )}</span>
                        </div>
                        <div className="flex justify-between py-5 text-xl border-b-2 border-slate-800 mt-2">
                            <span className="font-black text-slate-900 uppercase text-lg tracking-wider">Total</span>
                            <span className="font-black text-indigo-600">{formatCurrency( invoice.amount )}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-12 pb-16 pt-8 mt-auto absolute bottom-0 left-0 right-0">
                    <div className="border-t border-slate-200 pt-8 text-center">
                        <p className="text-slate-800 font-bold text-sm tracking-wide">Thank you for your business!</p>
                        <p className="text-slate-400 text-xs mt-2">Please make all checks payable to Acme Corp Ltd. Due within 30 days.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
