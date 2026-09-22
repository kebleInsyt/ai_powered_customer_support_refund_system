import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import QueryProvider from '../providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Worknoon AI Refund System',
  description: 'AI-Powered Customer Support Refund Resolution Engine with Gemini',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900 min-h-screen flex flex-col">
        <QueryProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white/60 backdrop-blur-md py-4 text-center text-xs text-slate-500">
            Worknoon FullStack Challenge &bull; Automated Dispute Resolution Platform &bull; &copy; 2026 by Kelechi Chiemeka
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
