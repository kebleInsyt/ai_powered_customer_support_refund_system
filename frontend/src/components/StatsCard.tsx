'use client';

import { DashboardStats } from '../lib/types';
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, BarChart3 } from 'lucide-react';

interface Props {
  stats: DashboardStats;
}

export default function StatsCard({ stats }: Props) {
  const cards = [
    {
      label: 'Total Requests',
      value: stats.totalRequests,
      icon: BarChart3,
      color: 'text-slate-900',
      bg: 'bg-slate-50 border-slate-200',
    },
    {
      label: 'Auto-Approved',
      value: stats.approved,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/60 border-emerald-200',
    },
    {
      label: 'Denied',
      value: stats.denied,
      icon: XCircle,
      color: 'text-rose-700',
      bg: 'bg-rose-50/60 border-rose-200',
    },
    {
      label: 'Escalated (Human Review)',
      value: stats.escalated,
      icon: AlertTriangle,
      color: 'text-amber-700',
      bg: 'bg-amber-50/60 border-amber-200',
    },
    {
      label: 'Prompt Injections',
      value: stats.promptInjections,
      icon: ShieldAlert,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50/60 border-indigo-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className={`p-4 rounded-2xl border shadow-sm ${c.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{c.label}</span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <span className={`text-2xl font-bold ${c.color}`}>{c.value}</span>
          </div>
        );
      })}
    </div>
  );
}
