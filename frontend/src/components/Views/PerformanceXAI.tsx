import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Info,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  PredictionTask,
  GlobalFeatureImportance,
  PatientExplanation,
  PatientPreset,
} from '../../types';
import {
  getGlobalImportance,
  getPatientExplanation,
  getPatientPresets,
} from '../../lib/api';

interface PerformanceXAIProps {
  activeTask: PredictionTask;
}

export const PerformanceXAI: React.FC<PerformanceXAIProps> = ({ activeTask }) => {
  const [globalImportance, setGlobalImportance] = useState<GlobalFeatureImportance | null>(null);
  const [presets, setPresets] = useState<PatientPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cvd_high');
  const [explanation, setExplanation] = useState<PatientExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'waterfall' | 'global' | 'recourse'>('waterfall');

  // Load presets and global importance
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      try {
        const [presetList, glob] = await Promise.all([
          getPatientPresets(),
          getGlobalImportance(activeTask),
        ]);
        if (isMounted) {
          setPresets(presetList);
          setGlobalImportance(glob);

          // Select appropriate default preset based on active task
          const defaultPreset = activeTask === 'diabetes'
            ? (presetList.find(p => p.id === 'diabetes_high') || presetList[0])
            : (presetList.find(p => p.id === 'cvd_high') || presetList[0]);

          if (defaultPreset) {
            setSelectedPresetId(defaultPreset.id);
            fetchExplanation(defaultPreset.features, activeTask);
          }
        }
      } catch (err) {
        console.warn('Error loading initial XAI data:', err);
      }
    }
    loadInitial();
    return () => { isMounted = false; };
  }, [activeTask]);

  // Fetch explanation for current features
  const fetchExplanation = async (features: Record<string, number>, task: PredictionTask) => {
    setLoading(true);
    try {
      const res = await getPatientExplanation(task, features);
      setExplanation(res);
    } catch (err) {
      console.error('Failed to get patient explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: PatientPreset) => {
    setSelectedPresetId(preset.id);
    fetchExplanation(preset.features, activeTask);
  };

  const currentPreset = presets.find(p => p.id === selectedPresetId);

  // Category badge colors matching clinical waterfall design
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Demographic':
        return 'bg-rose-50/80 text-rose-700 border-rose-200/80';
      case 'Metabolic':
        return 'bg-amber-50/80 text-amber-800 border-amber-200/80';
      case 'Hemodynamic':
        return 'bg-blue-50/80 text-blue-700 border-blue-200/80';
      case 'Lipid Profile':
        return 'bg-purple-50/80 text-purple-700 border-purple-200/80';
      default:
        return 'bg-teal-50/80 text-teal-700 border-teal-200/80';
    }
  };

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-[#e2e8f0]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#24332e] tracking-tight">
              Federated Model Explainability (XAI)
            </h2>
          </div>
          <p className="text-xs text-[#6c7771] mt-1 max-w-2xl">
            Axiomatic <strong>Integrated Gradients</strong> path attribution &amp; clinical counterfactual recourse across the dual-head MultiTask neural network.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('waterfall')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'waterfall'
                ? 'bg-white text-[#24332e] font-bold shadow-xs'
                : 'text-[#6c7771] hover:text-[#24332e]'
            }`}
          >
            Local Patient Attribution
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'global'
                ? 'bg-white text-[#24332e] font-bold shadow-xs'
                : 'text-[#6c7771] hover:text-[#24332e]'
            }`}
          >
            Global Biomarker Importance
          </button>
          <button
            onClick={() => setActiveTab('recourse')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'recourse'
                ? 'bg-white text-[#24332e] font-bold shadow-xs'
                : 'text-[#6c7771] hover:text-[#24332e]'
            }`}
          >
            Clinical Recourse ('What-If')
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: LOCAL WATERFALL ATTRIBUTION ==================== */}
      {activeTab === 'waterfall' && (
        <div className="space-y-5">
          {/* Preset Clinical Cohort Selector */}
          <div className="clinical-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#24332e] flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#315c4b]" />
                <span>Select Clinical Patient Archetype:</span>
              </span>
              {loading && (
                <span className="text-[11px] text-teal-700 flex items-center space-x-1 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Computing Integrated Gradients...</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {presets.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 shadow-xs ring-1 ring-teal-600'
                        : 'border-[#e2e8f0] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-teal-900' : 'text-[#24332e]'}`}>
                        {p.name.split(' (')[0]}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#6c7771] mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Risk Summary KPI Cards */}
          {explanation && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="clinical-card p-4">
                <span className="text-[11px] text-[#6c7771] font-semibold block">Population Base Risk F(x&apos;)</span>
                <span className="text-2xl font-bold text-slate-800 font-mono mt-1 block">
                  {(explanation.base_risk * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Expected healthy reference baseline
                </span>
              </div>

              <div className="clinical-card p-4">
                <span className="text-[11px] text-[#6c7771] font-semibold block">Patient Risk Shift &Sigma;&phi;</span>
                <span className={`text-2xl font-bold font-mono mt-1 block ${
                  explanation.risk_shift >= 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {explanation.risk_shift >= 0 ? '+' : ''}{(explanation.risk_shift * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-[#6c7771] mt-0.5 block">
                  Net biomarker path attribution
                </span>
              </div>

              <div className="clinical-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6c7771] font-semibold block">Predicted Risk F(x)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    explanation.predicted_risk >= explanation.threshold
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {explanation.predicted_risk >= explanation.threshold ? 'Elevated Risk' : 'Low Risk'}
                  </span>
                </div>
                <span className="text-2xl font-bold text-[#24332e] font-mono mt-1 block">
                  {(explanation.predicted_risk * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Decision threshold: {(explanation.threshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Bidirectional Waterfall Risk Decomposition Graph matching clinical screenshot */}
          {explanation && (
            <div className="space-y-3">
              {/* Context Banner */}
              <div className="px-1">
                <h3 className="text-base sm:text-lg font-bold text-[#1e293b] tracking-tight">
                  Waterfall risk decomposition isolates the precise physiological drivers of elevated clinical risk.
                </h3>
                <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
                  An additive breakdown reveals exactly how specific patient vitals push probability above or below baseline.
                </p>
              </div>

              {/* White Card Container */}
              <div className="clinical-card p-6 sm:p-7">
                {/* Card Header & Legend */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#1e293b]">
                      Biomarker Risk Attribution Decomposition
                    </h4>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Decomposes how each patient vital pushes probability above (+) or below (-) baseline.
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs shrink-0">
                    <span className="flex items-center space-x-1.5 text-slate-700">
                      <span className="w-3 h-3 rounded-[3px] bg-[#e11d48]"></span>
                      <span className="font-medium">Adverse Risk Driver</span>
                    </span>
                    <span className="flex items-center space-x-1.5 text-slate-700">
                      <span className="w-3 h-3 rounded-[3px] bg-[#10b981]"></span>
                      <span className="font-medium">Protective Factor</span>
                    </span>
                  </div>
                </div>

                {/* Bidirectional Diverging Waterfall Rows */}
                <div className="overflow-x-auto pt-2">
                  <div className="min-w-[840px]">
                    {(() => {
                      const maxAttrPct = Math.max(
                        ...explanation.features.map(f => Math.abs(f.attributionPercent)),
                        4.0
                      );
                      const maxBarPx = 220; // maximum visual bar length in pixels

                      return explanation.features.map((feat) => {
                        const isDriver = feat.attribution > 0.0005;
                        const isProtective = feat.attribution < -0.0005;
                        const isNeutral = !isDriver && !isProtective;
                        const barWidth = Math.max(8, Math.min(maxBarPx, (Math.abs(feat.attributionPercent) / maxAttrPct) * maxBarPx));

                        return (
                          <div
                            key={feat.feature}
                            className="flex items-center border-b border-slate-100/90 py-3 hover:bg-slate-50/50 transition-colors"
                          >
                            {/* Left Half (0% to 50%): Biomarker Info + Protective Bar */}
                            <div className="w-1/2 flex items-center justify-between pr-3 gap-2">
                              {/* Metadata on the far left */}
                              <div className="flex items-center space-x-2 min-w-0 flex-1 truncate pr-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded border font-medium shrink-0 ${getCategoryBadgeClass(feat.category)}`}>
                                  {feat.category}
                                </span>
                                <span className="text-xs font-semibold text-[#1e293b] shrink-0">
                                  {feat.displayName}
                                </span>
                                <span className="text-xs text-[#64748b] font-mono shrink-0">
                                  = {feat.value} {feat.unit}
                                </span>
                                <span className="text-[11px] text-slate-400 shrink-0">
                                  (ref: {feat.normalRange})
                                </span>
                              </div>

                              {/* Protective Bar Area (aligned right, touches center line) */}
                              <div className="flex items-center justify-end space-x-2 shrink-0">
                                {isProtective && (
                                  <>
                                    <span className="text-xs whitespace-nowrap">
                                      <strong className="text-[#059669] font-bold">-{Math.abs(feat.attributionPercent).toFixed(1)}%</strong>{' '}
                                      <span className="text-slate-600 font-normal">protective</span>
                                    </span>
                                    <div
                                      className="h-6 bg-[#10b981] rounded-l-md transition-all duration-500"
                                      style={{ width: `${barWidth}px` }}
                                    />
                                  </>
                                )}
                                {isNeutral && (
                                  <span className="text-xs text-slate-500 whitespace-nowrap font-medium pr-1">
                                    0.0% protective
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Center 0% Baseline Vertical Line */}
                            <div className="w-[1.5px] h-8 bg-slate-300 shrink-0 self-center" />

                            {/* Right Half (50% to 100%): Adverse Bar */}
                            <div className="w-1/2 flex items-center justify-start pl-3 gap-2">
                              {isDriver && (
                                <div className="flex items-center justify-start space-x-2">
                                  <div
                                    className="h-6 bg-[#e11d48] rounded-r-md transition-all duration-500"
                                    style={{ width: `${barWidth}px` }}
                                  />
                                  <span className="text-xs whitespace-nowrap">
                                    <strong className="text-[#e11d48] font-bold">+{feat.attributionPercent.toFixed(1)}%</strong>{' '}
                                    <span className="text-slate-600 font-normal">increases risk</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: GLOBAL FEATURE IMPORTANCE ==================== */}
      {activeTab === 'global' && (
        <div className="clinical-card p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#24332e]">
                Global Consensus Biomarker Importance Ranking
              </h3>
              <p className="text-xs text-[#6c7771] mt-0.5">
                Aggregated path gradients across the federated consensus model for{' '}
                <strong className="text-[#24332e]">
                  {activeTask === 'heart' ? 'Cardiovascular Disease (CVD)' : 'Type 2 Diabetes'}
                </strong>.
              </p>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs">
              <span className="font-semibold">Top Driver: </span>
              {globalImportance?.top_feature || 'Systolic Blood Pressure'}
            </div>
          </div>

          {/* Ranking Bars */}
          <div className="space-y-3">
            {globalImportance?.rankings.map((rank) => (
              <div key={rank.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 text-center font-mono font-bold text-slate-400 text-[11px]">
                      #{rank.rank}
                    </span>
                    <span className="font-semibold text-[#24332e]">
                      {rank.displayName}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${getCategoryBadgeClass(rank.category)}`}>
                      {rank.category}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-700">
                    {rank.percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${rank.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Architecture Rationale */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#6c7771] space-y-1.5">
            <div className="flex items-center space-x-1.5 text-[#24332e] font-semibold">
              <Info className="w-4 h-4 text-teal-700" />
              <span>Multi-Task Routing Interpretation:</span>
            </div>
            <p>
              In our shared-encoder architecture (12 &rarr; 64 &rarr; 32), demographic and body composition factors (Age, BMI) establish shared baseline representations, while task-specific heads heavily weight physiological pathways (e.g., HbA1c/Glucose for Diabetes; Systolic BP/Lipids for Heart Disease).
            </p>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: COUNTERFACTUAL RECOURSE ('WHAT-IF') ==================== */}
      {activeTab === 'recourse' && (
        <div className="space-y-5">
          <div className="clinical-card p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#24332e]">
                  Clinical Counterfactual Recourse Planning
                </h3>
                <p className="text-xs text-[#6c7771] mt-0.5">
                  Actionable biomarker interventions calculated via gradient sensitivity to reduce patient risk below threshold.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Target Threshold: &lt; {((explanation?.threshold || 0.2) * 100).toFixed(0)}%
              </span>
            </div>

            {explanation && explanation.recourse_suggestions && explanation.recourse_suggestions.length > 0 ? (
              <div className="space-y-3.5 mt-4">
                {explanation.recourse_suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#24332e]">
                          {sug.displayName}
                        </span>
                        <div className="flex items-center space-x-1 text-xs font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          <span>{sug.currentValue}</span>
                          <ArrowRight className="w-3 h-3 text-teal-600 inline" />
                          <span className="text-teal-700 font-bold">{sug.targetValue}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#6c7771]">
                        {sug.action}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg font-mono">
                        {sug.estimatedRiskReduction} Risk
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">Estimated Impact</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-emerald-950">Patient Markers Within Target Range</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  This patient profile already meets low-risk physiological targets for {activeTask === 'heart' ? 'Heart Disease' : 'Diabetes'}. No urgent counterfactual intervention required.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
