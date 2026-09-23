'use client';

import { X, ShieldCheck, Clock, Ban, DollarSign, PackageCheck, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PolicyModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const sections = [
    {
      icon: Clock,
      title: '30-Day Standard Eligibility Window',
      description:
        'All standard retail orders are eligible for return or refund consideration within thirty (30) calendar days from the verified carrier delivery timestamp. Orders exceeding 30 days are past the return window.',
    },
    {
      icon: Ban,
      title: 'Final Sale & Clearance Exclusions',
      description:
        'Items explicitly tagged as "Final Sale", promotional seasonal clearance, or digital downloadable license keys are strictly non-refundable once purchased and delivered.',
    },
    {
      icon: DollarSign,
      title: 'High-Value Supervisor Review ($500+ Threshold)',
      description:
        'To prevent financial fraud and protect consumer accounts, refund requests totaling more than $500.00 USD require secondary review and authorization by a senior support specialist before disbursement.',
    },
    {
      icon: PackageCheck,
      title: 'Damaged, Defective, or Mismatched Goods',
      description:
        'If an item arrives damaged in transit, with manufacturing defects, or does not match the purchased SKU, it qualifies for expedited refund or replacement upon verification of customer-submitted details.',
    },
    {
      icon: AlertCircle,
      title: 'Delivery Disputes & Courier Verification',
      description:
        'If a claim is submitted for non-receipt while carrier telemetry confirms delivery with recorded signature proof, the ticket is forwarded to logistics dispatch for formal courier audit.',
    },
    {
      icon: ShieldCheck,
      title: 'Disbursement & Processing Timelines',
      description:
        'Automatically approved refunds are credited back to the original payment method within 3–5 business days. Escalated claims undergoing human review are completed within 24–48 hours.',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Store Refund & Return Policy</h2>
              <p className="text-xs text-slate-500">Official guidelines and customer return standards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm">
          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            Our automated customer support system evaluates all return and refund requests in accordance with these standards. Cases that meet standard criteria are resolved instantly; claims requiring extra verification are seamlessly routed to human specialists.
          </p>

          <div className="space-y-3 pt-1">
            {sections.map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon className="w-4 h-4 text-sky-600 shrink-0" />
                    <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">{sec.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6.5">{sec.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">Standard Consumer Protection Standards &bull; WORKNOON</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
