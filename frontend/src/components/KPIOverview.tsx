import React from 'react';
import { Building2, RotateCcw, Box, Crosshair, ArrowUpRight } from 'lucide-react';
import { DashboardData } from '../types';

interface KPIOverviewProps {
  data: DashboardData | null;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({ data }) => {
  const sitesCount = data?.sites_count ?? 3;
  const completedRounds = data?.completed_rounds ?? 0;
  const currentRound = data?.current_round ?? 1;
  const globalVersion = data?.global_model?.version ?? 'v1.0.0';
  const accuracy = data?.global_model?.accuracy ? (data.global_model.accuracy * 100).toFixed(1) : '50.0';
  const delta = data?.global_model?.delta !== undefined 
    ? (data.global_model.delta * 100).toFixed(1) 
    : '0.0';
  const isPositiveDelta = Number(delta) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Participating Hospitals */}
      <div className="clinical-card p-5 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-[#24332e] tracking-tight">{sitesCount}</div>
          <div className="text-xs font-semibold text-[#24332e] mt-0.5">Participating Hospitals</div>
          <div className="text-[11px] text-[#6c7771] mt-0.5">Local data • Private</div>
        </div>
      </div>

      {/* Card 2: Training Rounds Completed */}
      <div className="clinical-card p-5 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <RotateCcw className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-[#24332e] tracking-tight">{completedRounds}</div>
          <div className="text-xs font-semibold text-[#24332e] mt-0.5">Training Rounds Completed</div>
          <div className="text-[11px] text-[#6c7771] mt-0.5">
            {data?.is_training_active ? `Active Round: ${data.active_round_id || currentRound}` : `Next Round: ${currentRound}`}
          </div>
        </div>
      </div>

      {/* Card 3: Global Model Version */}
      <div className="clinical-card p-5 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-[#24332e] tracking-tight">{globalVersion}</div>
          <div className="text-xs font-semibold text-[#24332e] mt-0.5">Global Model Version</div>
          <div className="text-[11px] text-[#6c7771] mt-0.5">
            {data?.global_model?.lastUpdated ? `Updated: ${data.global_model.lastUpdated}` : 'Last updated: 2m ago'}
          </div>
        </div>
      </div>

      {/* Card 4: Avg. Accuracy (Global Model) */}
      <div className="clinical-card p-5 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <Crosshair className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-bold text-[#24332e] tracking-tight">{accuracy}%</div>
          <div className="text-xs font-semibold text-[#24332e] mt-0.5">Avg. Accuracy (Global Model)</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{isPositiveDelta ? `+${delta}%` : `${delta}%`} vs. previous round</span>
          </div>
        </div>
      </div>
    </div>
  );
};
