import React, { useState } from 'react';
import {
  Database,
  Server,
  Lock,
  Globe2,
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  Maximize2,
  X,
} from 'lucide-react';
import archImage from '../../resources/arch.png';

export const DataFlowPrivacy: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
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

      {/* System Architecture Diagram Card */}
      <div className="clinical-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#24332e] tracking-tight">System Architecture Diagram</h2>
            <p className="text-xs text-[#6c7771] mt-0.5">High-level architectural blueprint of the multi-task federated learning network.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] flex items-center space-x-1.5 self-start sm:self-auto bg-blue-50/70 border border-blue-200/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>View Fullscreen</span>
          </button>
        </div>

        {/* Architecture Image Display Container */}
        <div
          onClick={() => setModalOpen(true)}
          className="w-full bg-white border border-slate-200 rounded-2xl p-3 sm:p-6 flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 transition-all shadow-xs group"
        >
          <img
            src={archImage}
            alt="Federated Learning Architecture Diagram"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/arch.png';
            }}
            className="w-full max-h-[520px] object-contain rounded-xl group-hover:scale-[1.005] transition-transform duration-200"
          />
          <span className="text-[11px] text-[#6c7771] mt-3 flex items-center space-x-1 group-hover:text-[#24332e] transition-colors">
            <Maximize2 className="w-3 h-3" />
            <span>Click to expand architecture diagram</span>
          </span>
        </div>

        {/* Technical Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-bold text-[#24332e]">1. Decentralized Client Nodes</span>
            </div>
            <p className="text-[11px] text-[#6c7771] leading-relaxed">
              Hospital sites train local PyTorch models inside their secure firewalls. Raw patient EHR records never traverse external networks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="font-bold text-[#24332e]">2. Secure Parameter Transport</span>
            </div>
            <p className="text-[11px] text-[#6c7771] leading-relaxed">
              Only model weight updates with optional Differential Privacy (Gaussian noise &amp; gradient clipping) are securely broadcast.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-[#24332e]">3. Multi-Task Central Aggregation</span>
            </div>
            <p className="text-[11px] text-[#6c7771] leading-relaxed">
              FedAvg server performs sample-weighted aggregation to continuously refine global multi-task disease classification heads.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#24332e]">System Architecture Diagram</h3>
                <p className="text-xs text-[#6c7771]">High-resolution view of FedPred multi-task federated workflow</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-50/50 rounded-xl p-4 border border-slate-100">
              <img
                src={archImage}
                alt="System Architecture Diagram Full"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
