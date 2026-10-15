import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { DashboardData, PredictionTask, RoundRecord, ActivityLog } from '../types';
import { KPIOverview } from './KPIOverview';
import { FederatedFlow } from './FederatedFlow';
import { LiveProgress } from './LiveProgress';
import { PerformanceChart } from './PerformanceChart';
import { PredictionInsights } from './PredictionInsights';

interface DashboardProps {
  data: DashboardData | null;
  rounds: RoundRecord[];
  logs: ActivityLog[];
  activeTask: PredictionTask;
  onTaskChange: (task: PredictionTask) => void;
  onStartRound: () => void;
  isStartingRound: boolean;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  rounds,
  activeTask,
  onTaskChange,
  onStartRound,
  isStartingRound,
  onNavigateTab
}) => {
  const isTrainingActive = data?.is_training_active || isStartingRound;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24332e] tracking-tight">
            Good evening, Amar
          </h1>
          <p className="text-xs text-[#6c7771] mt-1">
            Privacy-preserving federated healthcare intelligence network across 3 distributed hospitals.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Task Switcher Selector */}
          <div className="flex items-center bg-white border border-[#e2e8f0] p-1 rounded-xl shadow-sm text-xs">
            <button
              onClick={() => onTaskChange('heart')}
              disabled={isTrainingActive}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTask === 'heart'
                  ? 'bg-[#e8eef4] text-[#2563eb] font-semibold shadow-sm'
                  : 'text-[#6c7771] hover:text-[#24332e]'
              }`}
            >
              Heart Disease
            </button>
            <button
              onClick={() => onTaskChange('diabetes')}
              disabled={isTrainingActive}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTask === 'diabetes'
                  ? 'bg-[#e8eef4] text-[#2563eb] font-semibold shadow-sm'
                  : 'text-[#6c7771] hover:text-[#24332e]'
              }`}
            >
              Diabetes
            </button>
          </div>

          {/* Start New Round Button */}
          <button
            onClick={onStartRound}
            disabled={isTrainingActive}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all ${
              isTrainingActive
                ? 'bg-[#1e293b]/85 text-slate-200 border border-slate-700 cursor-not-allowed shadow-none'
                : 'bg-[#1e293b] text-white hover:bg-[#0f172a] active:scale-[0.98] shadow-md'
            }`}
          >
            {isTrainingActive ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-400 shrink-0" />
                <span className="text-emerald-400 font-semibold">Round In Progress...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="text-white">Start New Round</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 1: KPI Overview Cards */}
      <KPIOverview data={data} activeTask={activeTask} />

      {/* Row 2: Network Topology & Live Training Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Federated Learning Topology Flow (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <FederatedFlow
            data={data}
            onViewPerformance={() => onNavigateTab('performance')}
          />
        </div>

        {/* Live Training Progress & Telemetry (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <LiveProgress data={data} />
        </div>
      </div>

      {/* Row 3: Model Performance Curves & Real-Time Clinical Inference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Performance Chart: AUROC Discrimination & Loss (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <PerformanceChart rounds={rounds} activeTask={activeTask} />
        </div>

        {/* Clinical Prediction & Risk Inference (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <PredictionInsights onViewDetailedMetrics={() => onNavigateTab('performance')} />
        </div>
      </div>
    </div>
  );
};
