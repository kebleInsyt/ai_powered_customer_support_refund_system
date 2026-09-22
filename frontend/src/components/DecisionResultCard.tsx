'use client';

import Link from 'next/link';
import { RefundEvaluationResponse } from '../lib/types';
import { CheckCircle2, XCircle, AlertTriangle, ShieldAlert, ArrowRight, BookOpen, Headphones } from 'lucide-react';

interface Props {
  decision: RefundEvaluationResponse;
  onReset: () => void;
}

export default function DecisionResultCard({ decision, onReset }: Props) {
  const isApproved = decision.status === 'Approved';
  const isDenied = decision.status === 'Denied';
  const isEscalated = decision.status === 'Escalated';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            System Decision Outcome
          </span>
          <div className="flex items-center gap-2">
            {isApproved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                APPROVED
              </span>
            )}
            {isDenied && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <XCircle className="w-4 h-4 text-rose-600" />
                DENIED
              </span>
            )}
            {isEscalated && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                ESCALATED TO HUMAN REVIEW
              </span>
            )}

            <span className="text-xs text-slate-500 font-medium">
              Reference #{decision.refundId.slice(0, 16)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Assessment Confidence</span>
          <span className="text-sm font-bold text-slate-800">
            {(decision.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Security Alert if Prompt Injection was Attempted */}
      {decision.promptInjectionDetected && (
        <div className="my-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-rose-800 text-sm">Adversarial Prompt Injection Flagged</h5>
            <p className="mt-0.5 text-rose-700">
              The input contained override heuristics or system command patterns. The automated system intercepted the request, clamped the decision, and dispatched a security audit log to support supervisors.
            </p>
            {decision.securityNotice && (
              <p className="mt-1 font-mono text-[11px] text-rose-800 bg-rose-100/70 p-1.5 rounded">
                {decision.securityNotice}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Customer-Facing Message */}
      <div className="my-5 p-5 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Headphones className="w-3.5 h-3.5 text-sky-600" />
          <span>Customer Support Response</span>
        </h4>
        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line">
          {decision.customerFacingMessage}
        </p>
      </div>

      {/* Policy Citations & Internal Audit Reason */}
      <div className="space-y-3 text-xs">
        {decision.policyCitations.length > 0 && (
          <div>
            <span className="font-semibold text-slate-600 flex items-center gap-1 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Policy Rules Evaluated:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              {decision.policyCitations.map((cite, idx) => (
                <li key={idx}>{cite}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-3 bg-slate-100/70 rounded-lg text-slate-600 border border-slate-200/60">
          <span className="font-semibold text-slate-700 block mb-0.5">Internal Audit Reasoning:</span>
          <p className="font-mono text-[11px] text-slate-700">{decision.internalReasoning}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          &larr; Submit Another Test Claim
        </button>

        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 transition-all hover:bg-sky-100"
        >
          <span>Inspect in Support Admin Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
