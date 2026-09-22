'use client';

import { useState } from 'react';
import { RefundRequest, AuditLog, Order } from '../lib/types';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Terminal, Check, MessageSquare } from 'lucide-react';
import { resolveRefund } from '../lib/api';

interface Props {
  refund: RefundRequest;
  auditLog?: AuditLog;
  order?: Order;
  onClose: () => void;
  onUpdated: () => void;
}

export default function AuditDrawer({ refund, auditLog, order, onClose, onUpdated }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'prompt'>('overview');
  const [agentName, setAgentName] = useState('Support Agent Sarah');
  const [agentNotes, setAgentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  let policyFlags: string[] = [];
  try {
    policyFlags = JSON.parse(refund.policy_flags || '[]');
  } catch { }

  const handleResolve = async (newStatus: 'Approved' | 'Denied') => {
    if (!agentName.trim()) return;
    setIsSubmitting(true);
    try {
      await resolveRefund(refund.id, newStatus, agentName, agentNotes);
      setActionSuccess(`Refund marked as ${newStatus} by ${agentName}.`);
      setTimeout(() => {
        onUpdated();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to update refund status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Refund Inspector</h3>
              <span className="font-mono text-xs text-slate-500">#{refund.id.slice(0, 16)}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Order: {refund.order_number || refund.order_id} &bull; Customer: {refund.customer_name}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 gap-4 bg-white text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all ${activeTab === 'overview' ? 'border-sky-600 text-sky-700' : 'border-transparent hover:text-slate-900'
              }`}
          >
            Overview & Action
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition-all ${activeTab === 'audit' ? 'border-sky-600 text-sky-700' : 'border-transparent hover:text-slate-900'
              }`}
          >
            Policy & Security Flags
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`py-3 border-b-2 transition-all ${activeTab === 'prompt' ? 'border-sky-600 text-sky-700' : 'border-transparent hover:text-slate-900'
              }`}
          >
            Raw LLM Telemetry
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {actionSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              {/* Status Badge */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Current Status
                  </span>
                  <div className="flex items-center gap-2">
                    {refund.status === 'Approved' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                    {refund.status === 'Denied' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Denied
                      </span>
                    )}
                    {refund.status === 'Escalated' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Escalated (Pending Supervisor)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Requested Refund
                  </span>
                  <span className="text-lg font-bold text-slate-900">${refund.requested_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Explanation */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1" >Customer Submitted Explanation</span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                  {refund.customer_explanation}
                </div>
              </div>

              {/* System Audit Reasoning */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5 flex items-center gap-1">
                  AI & Policy Decision Reasoning
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {refund.decision_reason}
                </div>
              </div>

              {/* Human Support Resolution Controls (if Escalated) */}
              {refund.status === 'Escalated' && (
                <div className="mt-6 p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-slate-900 text-xs">Human Support Override Action</h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    This ticket was escalated for human verification. You can review the order details and make a final ruling.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Agent Name</label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Audit Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Courier verified damage"
                        value={agentNotes}
                        onChange={(e) => setAgentNotes(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleResolve('Approved')}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Approve Escalated Refund
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleResolve('Denied')}
                      className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Reject / Deny Refund
                    </button>
                  </div>
                </div>
              )}

              {refund.resolved_by && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Resolved by:</span> {refund.resolved_by} on{' '}
                  {new Date(refund.resolved_at || '').toLocaleString()}
                  {refund.admin_notes && (
                    <span className="block mt-1 font-mono text-[11px] text-slate-500">
                      Notes: {refund.admin_notes}
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">Deterministic Flags Triggered</span>
                {policyFlags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {policyFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-mono text-[11px] font-semibold border border-rose-200"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-emerald-700 font-medium">No policy violations triggered. Clean record.</span>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-2">Security & Prompt Injection Status</span>
                {refund.prompt_injection_detected === 1 ? (
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-800 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Prompt Injection Attempt Intercepted!</span>
                      <p className="mt-0.5 text-[11px] text-rose-700">
                        Input was quarantined. Hard code overrides prevented model manipulation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-emerald-700 font-medium">Clean Input (No adversarial prompt patterns detected).</span>
                )}
              </div>

              {order && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-2">Order Items Reference</span>
                  <div className="space-y-1.5">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-[11px] text-slate-700 border-b border-slate-200/60 pb-1">
                        <span>
                          {item.product_name} {item.is_final_sale === 1 && <strong className="text-rose-600">(FINAL SALE)</strong>}
                        </span>
                        <span className="font-mono">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="font-bold text-slate-700 block mb-1.5">System Prompt & Context Sent to Gemini:</span>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] max-h-60 leading-tight">
                  {auditLog?.raw_prompt || 'No telemetry captured for this legacy row.'}
                </pre>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1.5">Raw Gemini JSON Response:</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] max-h-60 leading-tight">
                  {auditLog?.raw_llm_response || 'No telemetry captured for this legacy row.'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
