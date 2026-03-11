export default function Loading() {
    return (
        <div className="flex items-center justify-center py-20 text-slate-500">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium animate-pulse">Loading data...</p>
            </div>
        </div>
    );
}
