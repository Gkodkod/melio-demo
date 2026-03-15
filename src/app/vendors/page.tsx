import { Metadata } from 'next';
import { getVendors } from '@/lib/data';

export const metadata: Metadata = {
    title: 'Vendors | Melio',
    description: 'Manage your vendor relationships and payment methods.',
};
import VendorsTable from '@/components/vendors/vendors-table';
import PageHeader from '@/components/page-header';
import SearchInput from '@/components/search-input';
import AddVendorPanel from '@/components/vendors/add-vendor-panel';

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
                action={<AddVendorPanel />}
            />

            <SearchInput placeholder="Search vendors..." />

            <VendorsTable vendors={filtered} />
        </div>
    );
}

export const dynamic = 'force-dynamic';
