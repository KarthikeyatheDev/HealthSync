import React from 'react';
import {
  Database,
  Server,
  Lock,
  Globe2,
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  ImageIcon
} from 'lucide-react';

export const DataFlowPrivacy: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Existing Pipeline Card */}
      <div className="clinical-card p-6 flex flex-col justify-between">
        {/* Header */}
        <div>
          <h2 className="text-base font-bold text-[#24332e] tracking-tight">Data Flow &amp; Privacy</h2>
          <p className="text-xs text-[#6c7771] mt-0.5">How data stays secure and model updates are shared across hospital networks.</p>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div className="my-5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
          {/* Step 1: Local Data */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#24332e] mt-2">Local Data</span>
            <span className="text-[10px] text-[#6c7771]">(Private)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Stays at hospital</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1 hidden md:block" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-400 shrink-0 my-1 md:hidden" />

          {/* Step 2: Local Training */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#24332e] mt-2">Local Training</span>
            <span className="text-[10px] text-[#6c7771]">&amp; Update</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Gradients/Weights</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1 hidden md:block" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-400 shrink-0 my-1 md:hidden" />

          {/* Step 3: Secure Aggregation */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#24332e] mt-2">Secure Aggregation</span>
            <span className="text-[10px] text-[#6c7771]">(FedAvg)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Weighted avg</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1 hidden md:block" />
          <ArrowDown className="w-3.5 h-3.5 text-slate-400 shrink-0 my-1 md:hidden" />

          {/* Step 4: Global Model */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#24332e] mt-2">Global Model</span>
            <span className="text-[10px] text-[#6c7771]">(Updated)</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Shared inference</span>
          </div>
        </div>

        {/* Callout box */}
        <div className="pt-3 border-t border-[#e2e8f0]">
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-snug">
              <strong className="font-semibold text-emerald-950">Your data never leaves the hospital.</strong> Only model updates (not raw patient records) are shared using federated learning.
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture Diagram Placeholder Card */}
      <div className="clinical-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#24332e] tracking-tight">System Architecture Diagram</h2>
          <p className="text-xs text-[#6c7771] mt-0.5">High-level architectural blueprint of the multi-task federated learning network.</p>
        </div>

        {/* Placeholder image area */}
        <div className="w-full min-h-[380px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:bg-slate-100/60 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-[#24332e]">Architecture Diagram Placeholder</p>
          <p className="text-xs text-[#6c7771] max-w-sm mt-1">
            Placeholder image area. You can replace this later with your architecture diagram image file (e.g. <code className="bg-slate-200/70 px-1.5 py-0.5 rounded text-[11px] font-mono">architecture.png</code>).
          </p>
          <div className="mt-4 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-500 shadow-xs">
            /architecture-diagram.png
          </div>
          <img
            src="/architecture-diagram.png"
            alt="Federated Learning Architecture Diagram Placeholder"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
            className="mt-4 max-h-80 object-contain rounded-xl border border-slate-200 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};
