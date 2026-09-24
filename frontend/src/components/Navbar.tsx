'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReceiptText, UserCheck, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const isCustomerPortal = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <ReceiptText className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">WORKNOON</span>
            </div>
            <p className="text-xs text-slate-500">Automated Refund & Dispute Management</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
          <Link
            href="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isCustomerPortal
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Customer Portal</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isAdmin
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-600" />
            <span>Support Dashboard</span>
          </Link>
        </nav>

      </div>
    </header>
  );
}
