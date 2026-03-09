import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import Sidebar from '@/components/sidebar';

export const metadata: Metadata = {
  title: 'Melio – Vendor Payments Platform',
  description:
    'Modern vendor payments and invoice management platform. Pay vendors, manage invoices, and track transactions.',
};

export default function RootLayout( {
  children,
}: {
  children: React.ReactNode;
} ) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Providers>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 lg:ml-64">
                <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
