import { getInvoices } from '@/lib/data';
import SearchInput from '@/components/search-input';
import StatusFilter from '@/components/invoices/status-filter';
import InvoicesView from '@/components/invoices/invoices-view';

interface InvoicesPageProps {
    searchParams: Promise<{
        q?: string;
        status?: string;
    }>;
}

export default async function InvoicesPage( { searchParams }: InvoicesPageProps ) {
    const { q: search = '', status: filterStatus = 'all' } = await searchParams;
    const allInvoices = await getInvoices();

    const filtered = allInvoices.filter( ( inv ) => {
        const matchesSearch =
            inv.invoiceNumber.toLowerCase().includes( search.toLowerCase() ) ||
            inv.vendorName.toLowerCase().includes( search.toLowerCase() );
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    } );

    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <SearchInput placeholder="Search invoices..." />
                <StatusFilter />
            </div>

            <InvoicesView invoices={filtered} />

            {/* InvoicesView renders the table and modals */}
        </div>
    );
}

export const dynamic = 'force-dynamic';
