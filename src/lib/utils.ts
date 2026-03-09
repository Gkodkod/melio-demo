export function formatCurrency( amount: number, currency: string = 'USD' ): string {
    return new Intl.NumberFormat( 'en-US', {
        style: 'currency',
        currency: currency,
    } ).format( amount );
}

export function formatDate( dateStr: string ): string {
    return new Date( dateStr ).toLocaleDateString( 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    } );
}

export function formatDateTime( dateStr: string ): string {
    return new Date( dateStr ).toLocaleString( 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    } );
}

export function cn( ...classes: ( string | boolean | undefined | null )[] ): string {
    return classes.filter( Boolean ).join( ' ' );
}

export function getStatusColor( status: string ): string {
    const colors: Record<string, string> = {
        draft: 'bg-slate-100 text-slate-700',
        scheduled: 'bg-blue-100 text-blue-700',
        processing: 'bg-amber-100 text-amber-700',
        settled: 'bg-emerald-100 text-emerald-700',
        failed: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-red-100 text-red-700',
        paid: 'bg-emerald-100 text-emerald-700',
        verified: 'bg-emerald-100 text-emerald-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
}
