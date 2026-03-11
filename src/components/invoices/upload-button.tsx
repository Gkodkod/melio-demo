'use client';

import { Upload } from 'lucide-react';

export default function UploadInvoiceButton( { onClick }: { onClick: () => void } ) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
        >
            <Upload size={16} />
            Upload Invoice
        </button>
    );
}
