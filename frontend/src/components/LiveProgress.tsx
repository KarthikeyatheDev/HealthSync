import React from 'react';
import { Building2, CheckCircle2, Clock, CircleDot, Check } from 'lucide-react';
import { HospitalSite, DashboardData } from '../types';

interface LiveProgressProps {
  data: DashboardData | null;
}

export const LiveProgress: React.FC<LiveProgressProps> = ({ data }) => {
  const currentRound = data?.current_round ?? 6;
  const sites = data?.sites || [];
  const isTrainingActive = data?.is_training_active ?? false;
  const aggregationStep = data?.aggregation_step || 'idle';

  const getProgressVal = (site: HospitalSite) => {
    if (site.status === 'update_ready' || site.status === 'aggregated') return 100;
    if (site.status === 'training') return site.progressPercent || 65;
    return 0;
  };

  const getBarColor = (index: number) => {
    if (index === 0) return 'bg-teal-500';
    if (index === 1) return 'bg-blue-500';
    return 'bg-purple-500';
  };

  const getSiteIconBg = (index: number) => {
    if (index === 0) return 'text-teal-600 bg-teal-50 border-teal-200';
    if (index === 1) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-purple-600 bg-purple-50 border-purple-200';
  };

  // Step 1: Local updates received
  const step1Complete = ['updates_received', 'aggregating', 'completed'].includes(aggregationStep);
  // Step 2: Aggregation in progress
  const step2Active = aggregationStep === 'aggregating';
  const step2Complete = aggregationStep === 'completed';
  // Step 3: Global model updated
  const step3Complete = aggregationStep === 'completed';

  return (
    <div className="clinical-card p-6 flex flex-col justify-between h-full w-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#24332e] tracking-tight">Live Training Progress</h2>
          <span className="text-xs font-mono font-medium text-[#6c7771] bg-[#f8fafc] px-2.5 py-1 rounded-md border border-[#e2e8f0]">
            {data?.active_round_id ? `Round ${data.active_round_id}` : `Round ${currentRound} / 10`}
          </span>
        </div>
        <p className="text-xs text-[#6c7771] mt-1">
          {isTrainingActive ? 'Simulated federated round executing across clients' : 'Network idle. Ready for next training round.'}
        </p>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 my-6">
        {sites.map((site, index) => {
          const progress = getProgressVal(site);
          const barColor = getBarColor(index);
          const iconTheme = getSiteIconBg(index);

          return (
            <div key={site.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${iconTheme}`}>
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#24332e]">{site.name}</span>
                    <span className="text-[11px] text-[#6c7771] ml-2">({site.records.toLocaleString()} samples)</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[11px] text-[#6c7771]">{progress}%</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    site.status === 'training' 
                      ? 'bg-amber-100 text-amber-800' 
                      : site.status === 'update_ready' || site.status === 'aggregated'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {site.status === 'training' ? 'Training' : site.status === 'update_ready' ? 'Complete' : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Aggregation Progress Stepper */}
      <div className="pt-4 border-t border-[#e2e8f0]">
        <h3 className="text-xs font-bold text-[#24332e] mb-3">Aggregation Progress</h3>

        <div className="flex items-center justify-between text-xs">
          {/* Step 1 */}
          <div className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step1Complete ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {step1Complete ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span className="text-[10px] text-center font-medium mt-1.5 text-[#24332e] leading-tight">
              Local Updates<br />Received
            </span>
          </div>

          <div className={`h-0.5 flex-1 -mt-4 transition-colors ${step1Complete ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 2 */}
          <div className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step2Complete 
                ? 'bg-emerald-500 text-white' 
                : step2Active 
                ? 'bg-blue-600 text-white animate-pulse' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              {step2Complete ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span className="text-[10px] text-center font-medium mt-1.5 text-[#24332e] leading-tight">
              Aggregation<br />in Progress
            </span>
          </div>

          <div className={`h-0.5 flex-1 -mt-4 transition-colors ${step2Complete ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 3 */}
          <div className="flex flex-col items-center flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              step3Complete ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {step3Complete ? <Check className="w-3.5 h-3.5" /> : '3'}
            </div>
            <span className="text-[10px] text-center font-medium mt-1.5 text-[#24332e] leading-tight">
              Global Model<br />Updated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
