import React from 'react';
import { Building2, Share2, Cpu, ArrowDown, CheckCircle2, Clock } from 'lucide-react';
import { HospitalSite, DashboardData } from '../types';

interface FederatedFlowProps {
  data: DashboardData | null;
  onViewPerformance: () => void;
}

export const FederatedFlow: React.FC<FederatedFlowProps> = ({ data, onViewPerformance }) => {
  const sites = data?.sites || [
    { id: 'hospital_a', name: 'Hospital North (Hospital 1)', location: 'Hyderabad', records: 42868, status: 'ready', version: 'v1.0.0' },
    { id: 'hospital_b', name: 'Hospital Central (Hospital 2)', location: 'Delhi', records: 42868, status: 'ready', version: 'v1.0.0' },
    { id: 'hospital_c', name: 'Hospital South (Hospital 3)', location: 'Chennai', records: 42868, status: 'ready', version: 'v1.0.0' },
  ];

  const globalModel = data?.global_model || {
    version: 'v1.0.0',
    accuracy: 0.500,
  };

  const isAggregating = data?.aggregation_step === 'aggregating' || data?.aggregation_step === 'updates_received';
  const isCompleted = data?.aggregation_step === 'completed' || (!data?.is_training_active && data?.completed_rounds! > 0);

  const getSiteTheme = (index: number) => {
    if (index === 0) {
      return {
        border: 'border-teal-200',
        bg: 'bg-teal-50/40',
        iconBg: 'bg-teal-500',
        badge: 'bg-teal-100 text-teal-800',
        accent: 'text-teal-700',
        arrow: 'text-teal-500'
      };
    }
    if (index === 1) {
      return {
        border: 'border-blue-200',
        bg: 'bg-blue-50/40',
        iconBg: 'bg-blue-500',
        badge: 'bg-blue-100 text-blue-800',
        accent: 'text-blue-700',
        arrow: 'text-blue-500'
      };
    }
    return {
      border: 'border-purple-200',
      bg: 'bg-purple-50/40',
      iconBg: 'bg-purple-500',
      badge: 'bg-purple-100 text-purple-800',
      accent: 'text-purple-700',
      arrow: 'text-purple-500'
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'training':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 animate-pulse">
            Training
          </span>
        );
      case 'update_ready':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            Update ready
          </span>
        );
      case 'aggregated':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
            Aggregated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            Ready
          </span>
        );
    }
  };

  return (
    <div className="clinical-card p-6 flex flex-col justify-between h-full w-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#24332e] tracking-tight">Federated Learning Flow</h2>
          <span className="text-xs text-[#6c7771] bg-[#f8fafc] px-2.5 py-1 rounded-md border border-[#e2e8f0]">
            Simulated Network
          </span>
        </div>
        <p className="text-xs text-[#6c7771] mt-1">
          Each hospital trains on its local data. Model updates are aggregated to improve the global model.
        </p>
      </div>

      {/* 3 Hospital Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
        {sites.map((site, index) => {
          const theme = getSiteTheme(index);
          return (
            <div
              key={site.id}
              className={`border ${theme.border} ${theme.bg} rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg ${theme.iconBg} text-white flex items-center justify-center shrink-0`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#24332e]">{site.name}</h3>
                    <p className="text-[11px] text-[#6c7771]">({site.location})</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-[#6c7771] block">Dataset Size</span>
                  <span className="font-semibold text-[#24332e]">{site.records.toLocaleString()} records</span>
                </div>
                <div className="text-right">
                  {getStatusBadge(site.status)}
                  <span className="block text-[10px] text-[#6c7771] mt-1 font-mono">{site.version}</span>
                </div>
              </div>

              {site.lastMetrics && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-700 font-semibold">
                    Acc: {(site.lastMetrics.accuracy * 100).toFixed(1)}%
                  </span>
                  <span className="text-slate-600">
                    Train Loss: {site.lastMetrics.loss.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Downward Arrows connecting to FedAvg */}
      <div className="flex justify-around items-center -my-2 text-[#6c7771]">
        <div className="flex flex-col items-center">
          <ArrowDown className="w-4 h-4 text-teal-500 animate-bounce" />
        </div>
        <div className="flex flex-col items-center">
          <ArrowDown className="w-4 h-4 text-blue-500 animate-bounce" />
        </div>
        <div className="flex flex-col items-center">
          <ArrowDown className="w-4 h-4 text-purple-500 animate-bounce" />
        </div>
      </div>

      {/* Federated Averaging (FedAvg) Node */}
      <div className={`mt-3 border rounded-xl p-4 transition-all ${
        isAggregating 
          ? 'border-blue-400 bg-blue-50/60 shadow-md ring-2 ring-blue-200' 
          : 'border-[#e2e8f0] bg-[#f8fafc]'
      }`}>
        <div className="flex items-center justify-center space-x-3 text-center">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Share2 className={`w-4 h-4 ${isAggregating ? 'animate-spin' : ''}`} />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#24332e]">Federated Averaging (FedAvg)</span>
              {isAggregating && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold animate-pulse">
                  Aggregating weights...
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6c7771] mt-0.5">
              Aggregating model parameters (weighted by client sample counts) ...
            </p>
          </div>
        </div>
      </div>

      {/* Downward Arrow */}
      <div className="flex justify-center items-center my-2 text-[#6c7771]">
        <ArrowDown className="w-4 h-4 text-emerald-600" />
      </div>

      {/* Global Model Card */}
      <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#24332e]">Global Model</span>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {globalModel.version}
              </span>
              <span className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[#6c7771] mt-0.5">
              Accuracy: <strong className="text-emerald-700">{(globalModel.accuracy * 100).toFixed(1)}%</strong> on held-out test evaluation
            </p>
          </div>
        </div>

        <button
          onClick={onViewPerformance}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-[#24332e] hover:bg-slate-50 transition-colors shadow-sm"
        >
          View Performance
        </button>
      </div>
    </div>
  );
};
