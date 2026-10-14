import React from 'react';
import { Target, BarChart3, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { DashboardData, RoundRecord, PredictionTask } from '../../types';
import { PerformanceXAI } from './PerformanceXAI';

interface PerformanceViewProps {
  data: DashboardData | null;
  rounds: RoundRecord[];
  activeTask: PredictionTask;
  onTaskChange?: (task: PredictionTask) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  data,
  rounds,
  activeTask,
  onTaskChange
}) => {
  const hasCompletedRounds = rounds.length > 0;
  const latestRound = rounds[0];

  // Resolve task-specific evaluation if available
  const evalData = latestRound
    ? ((latestRound.task_evaluations && latestRound.task_evaluations[activeTask])
        ? latestRound.task_evaluations[activeTask]
        : latestRound.evaluation)
    : null;

  const cm = evalData?.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0]?.[0] ?? 0;
  const fp = cm[0]?.[1] ?? 0;
  const fn = cm[1]?.[0] ?? 0;
  const tp = cm[1]?.[1] ?? 0;

  return (
    <div className="space-y-6">
      {/* Header with Task Selector Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#24332e] tracking-tight">Model Performance &amp; Evaluation</h1>
          <p className="text-xs text-[#6c7771] mt-1">
            Rigorous clinical evaluation on held-out test dataset comparing global consensus model against isolated hospital baselines.
          </p>
        </div>

        {/* Task Switcher Selector */}
        {onTaskChange && (
          <div className="flex items-center bg-white border border-[#e2e8f0] p-1 rounded-xl shadow-xs text-xs self-start sm:self-auto">
            <button
              onClick={() => onTaskChange('heart')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTask === 'heart'
                  ? 'bg-[#e8eef4] text-[#2563eb] font-semibold shadow-xs'
                  : 'text-[#6c7771] hover:text-[#24332e]'
              }`}
            >
              Heart Disease
            </button>
            <button
              onClick={() => onTaskChange('diabetes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTask === 'diabetes'
                  ? 'bg-[#e8eef4] text-[#2563eb] font-semibold shadow-xs'
                  : 'text-[#6c7771] hover:text-[#24332e]'
              }`}
            >
              Diabetes
            </button>
          </div>
        )}
      </div>

      {/* When no rounds exist: Clean empty state with zero initialized/mock data */}
      {!hasCompletedRounds || !evalData ? (
        <div className="clinical-card p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#24332e]">No Performance Data Available</h3>
          <p className="text-xs text-[#6c7771] max-w-md">
            No federated training rounds have been completed yet. Run Round 1 from the Dashboard to compute and inspect held-out test evaluations for {activeTask === 'heart' ? 'Heart Disease' : 'Diabetes'}.
          </p>
        </div>
      ) : (
        <>
          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="clinical-card p-4 text-center">
              <span className="text-[11px] text-[#6c7771] font-semibold block">Accuracy</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono mt-1 block">
                {(evalData.accuracy * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">Consensus FedAvg</span>
            </div>

            <div className="clinical-card p-4 text-center">
              <span className="text-[11px] text-[#6c7771] font-semibold block">Test Loss (Brier)</span>
              <span className="text-2xl font-bold text-slate-800 font-mono mt-1 block">
                {evalData.loss.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Held-out Brier Loss</span>
            </div>

            <div className="clinical-card p-4 text-center">
              <span className="text-[11px] text-[#6c7771] font-semibold block">Precision</span>
              <span className="text-2xl font-bold text-blue-700 font-mono mt-1 block">
                {(evalData.precision * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-blue-600 mt-0.5 block font-medium">PPV (True Positives)</span>
            </div>

            <div className="clinical-card p-4 text-center">
              <span className="text-[11px] text-[#6c7771] font-semibold block">Recall / Sens.</span>
              <span className="text-2xl font-bold text-indigo-700 font-mono mt-1 block">
                {(evalData.recall * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-indigo-600 mt-0.5 block font-medium">Sensitivity</span>
            </div>

            <div className="clinical-card p-4 text-center">
              <span className="text-[11px] text-[#6c7771] font-semibold block">F1 Score</span>
              <span className="text-2xl font-bold text-purple-700 font-mono mt-1 block">
                {(evalData.f1 * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-purple-600 mt-0.5 block font-medium">Harmonic Mean</span>
            </div>

            <div className="clinical-card p-4 text-center">
              <span className="text-[11px] text-[#6c7771] font-semibold block">AUROC</span>
              <span className="text-2xl font-bold text-teal-700 font-mono mt-1 block">
                {evalData.auroc.toFixed(3)}
              </span>
              <span className="text-[10px] text-teal-600 mt-0.5 block font-medium">Discrimination</span>
            </div>
          </div>

          {/* Grid: Confusion Matrix + Local Baseline Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Confusion Matrix Card */}
            <div className="clinical-card p-6">
              <h2 className="text-sm font-bold text-[#24332e] mb-1">Held-Out Test Confusion Matrix</h2>
              <p className="text-xs text-[#6c7771] mb-5">
                Evaluation on {evalData.test_samples ? evalData.test_samples.toLocaleString() : '27,559'} unobserved clinical test records ({activeTask === 'heart' ? 'Heart Disease' : 'Diabetes'}).
              </p>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 font-medium block">True Negatives (TN)</span>
                  <strong className="text-xl font-bold text-emerald-950 font-mono mt-1 block">{tn}</strong>
                  <span className="text-[10px] text-emerald-700 mt-0.5 block">Correctly ruled out</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[11px] text-rose-800 font-medium block">False Positives (FP)</span>
                  <strong className="text-xl font-bold text-rose-950 font-mono mt-1 block">{fp}</strong>
                  <span className="text-[10px] text-rose-700 mt-0.5 block">Type I error</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[11px] text-amber-800 font-medium block">False Negatives (FN)</span>
                  <strong className="text-xl font-bold text-amber-950 font-mono mt-1 block">{fn}</strong>
                  <span className="text-[10px] text-amber-700 mt-0.5 block">Type II error</span>
                </div>
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                  <span className="text-[11px] text-teal-800 font-medium block">True Positives (TP)</span>
                  <strong className="text-xl font-bold text-teal-950 font-mono mt-1 block">{tp}</strong>
                  <span className="text-[10px] text-teal-700 mt-0.5 block">Correctly diagnosed risk</span>
                </div>
              </div>
            </div>

            {/* Local vs Global Gain Comparison */}
            <div className="clinical-card p-6">
              <h2 className="text-sm font-bold text-[#24332e] mb-1">Local Model vs Global FedAvg Gain</h2>
              <p className="text-xs text-[#6c7771] mb-5">
                Demonstrating privacy-preserving collaborative model enhancement for {activeTask === 'heart' ? 'Heart Disease' : 'Diabetes'}.
              </p>

              <div className="space-y-4 text-xs">
                {latestRound.participating_sites && latestRound.participating_sites.length > 0 ? (
                  latestRound.participating_sites.map((site) => (
                    <div key={site.site_id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-[#24332e]">{site.site_name}</span>
                        <span className="text-[11px] text-[#6c7771] block">
                          Trained on local cohort ({site.sample_count.toLocaleString()} samples)
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-700 font-bold">{(site.local_accuracy * 100).toFixed(1)}% Acc</span>
                        <span className="text-[10px] text-slate-500 block">Loss: {site.local_loss.toFixed(4)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No client participating site updates recorded.</p>
                )}

                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-emerald-950">Global Model ({latestRound.global_model_version})</span>
                    <span className="text-[11px] text-emerald-800 block">
                      Federated consensus across all {latestRound.total_samples ? latestRound.total_samples.toLocaleString() : '128,604'} patients
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-emerald-700 font-bold text-sm">{(evalData.accuracy * 100).toFixed(1)}% Acc</span>
                    <span className="text-[10px] text-emerald-600 block font-semibold">AUROC: {evalData.auroc.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Explainable AI (XAI) Suite */}
      <PerformanceXAI activeTask={activeTask} />
    </div>
  );
};
