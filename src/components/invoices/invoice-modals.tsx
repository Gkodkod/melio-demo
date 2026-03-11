'use client';

import { Upload, XCircle, CheckCircle } from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import InvoicePdfViewer from '@/components/invoice-pdf-viewer';

interface InvoiceModalsProps {
    showUploadModal: boolean;
    setShowUploadModal: ( show: boolean ) => void;
    showApprovalModal: Invoice | null;
    setShowApprovalModal: ( invoice: Invoice | null ) => void;
    showPdfViewer: Invoice | null;
    setShowPdfViewer: ( invoice: Invoice | null ) => void;
}

export default function InvoiceModals( {
    showUploadModal,
    setShowUploadModal,
    showApprovalModal,
    setShowApprovalModal,
    showPdfViewer,
    setShowPdfViewer,
}: InvoiceModalsProps ) {
    return (
        <>
            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal( false )}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={( e ) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-2">Upload Invoice</h2>
                        <p className="text-sm text-slate-400 mb-6">Upload a PDF or image of the vendor invoice.</p>
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
                            <Upload size={32} className="mx-auto text-slate-500 mb-3" />
                            <p className="text-sm text-slate-400">Drop file here or click to browse</p>
                            <p className="text-xs text-slate-600 mt-1">PDF, PNG, or JPG up to 10MB</p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowUploadModal( false )}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowUploadModal( false )}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowApprovalModal( null )}>
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl" onClick={( e ) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-2">Review Invoice</h2>
                        <p className="text-sm text-slate-400 mb-6">
                            Approve or reject this invoice for payment processing.
                        </p>
                        <div className="glass-card rounded-xl p-4 space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Invoice #</span>
                                <span className="text-white font-medium">{showApprovalModal.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Vendor</span>
                                <span className="text-white">{showApprovalModal.vendorName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Amount</span>
                                <span className="text-white font-semibold">{formatCurrency( showApprovalModal.amount )}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Due Date</span>
                                <span className="text-white">{formatDate( showApprovalModal.dueDate )}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Description</span>
                                <span className="text-white text-right max-w-[200px]">{showApprovalModal.description}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApprovalModal( null )}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors ring-1 ring-red-500/20"
                            >
                                <XCircle size={16} />
                                Reject
                            </button>
                            <button
                                onClick={() => setShowApprovalModal( null )}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors ring-1 ring-emerald-500/20"
                            >
                                <CheckCircle size={16} />
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPdfViewer && (
                <InvoicePdfViewer
                    invoice={showPdfViewer}
                    onClose={() => setShowPdfViewer( null )}
                />
            )}
        </>
    );
}
