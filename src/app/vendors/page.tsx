import { getVendors } from '@/lib/data';
import { Plus } from 'lucide-react';
import VendorsTable from '@/components/vendors/vendors-table';
import PageHeader from '@/components/page-header';
import SearchInput from '@/components/search-input';
import type { Vendor } from '@/lib/types';

interface VendorsPageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function VendorsPage( { searchParams }: VendorsPageProps ) {
    const { q: search = '' } = await searchParams;
    const vendors = await getVendors();

    const filtered = vendors.filter( ( v ) =>
        v.name.toLowerCase().includes( search.toLowerCase() ) ||
        v.email.toLowerCase().includes( search.toLowerCase() )
    );


    return (
        <div className="space-y-6 pt-8 lg:pt-0">
            <PageHeader
                title="Vendors"
                description="Manage your vendor relationships and payment methods. Click on a vendor name to view their details."
                action={
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                        <Plus size={16} />
                        Add Vendor
                    </button>
                }
            />

            <SearchInput placeholder="Search vendors..." />

            <VendorsTable vendors={filtered} />
        </div>
    );
}

export const dynamic = 'force-dynamic';
