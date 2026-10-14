import React, { useState } from 'react';
import { RotateCcw, CheckCircle2, Clock, Eye, Download, ChevronRight, X } from 'lucide-react';
import { RoundRecord, PredictionTask } from '../../types';

interface RoundsViewProps {
  rounds: RoundRecord[];
  activeTask: PredictionTask;
  onTaskChange?: (task: PredictionTask) => void;
}

export const RoundsView: React.FC<RoundsViewProps> = ({ rounds, activeTask, onTaskChange }) => {
  const [selectedRound, setSelectedRound] = useState<RoundRecord | null>(null);

  return (
    <div className="space-y-6">
      {/* Header with Task Selector Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#24332e] tracking-tight">Federated Training Rounds</h1>
          <p className="text-xs text-[#6c7771] mt-1">
            Historical record of completed federated rounds, participating sites, sample counts, and held-out test evaluations.
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

      {/* Table Card */}
      <div className="clinical-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-[#6c7771] border-b border-[#e2e8f0] font-semibold">
              <tr>
                <th className="py-3 px-4">Round ID</th>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Global Version</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Test Loss</th>
                <th className="py-3 px-4">F1 Score</th>
                <th className="py-3 px-4">AUROC</th>
                <th className="py-3 px-4">Clients</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {rounds.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium text-slate-500">No federated training rounds recorded yet</p>
                    <p className="text-xs text-slate-400 mt-1">Initiate a training round to distribute models across hospital nodes and start training.</p>
                  </td>
                </tr>
              ) : (
                rounds.map((r) => (
                  <tr key={r.round_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#24332e]">
                    {r.round_id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize font-medium text-slate-700">{r.task}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-50 text-emerald-800 font-mono text-[11px] font-semibold px-2 py-0.5 rounded">
                      {r.global_model_version}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">
                    {(r.evaluation.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {r.evaluation.loss.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {(r.evaluation.f1 * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {r.evaluation.auroc.toFixed(3)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    {r.participating_sites.length} sites ({r.total_samples?.toLocaleString() || '128,604'} samples)
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {r.duration_seconds}s
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedRound(r)}
                      className="px-2.5 py-1 rounded bg-white border border-[#e2e8f0] text-[#24332e] hover:bg-slate-50 font-medium text-[11px] shadow-sm"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Round Details Modal */}
      {selectedRound && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#24332e]">
                  Round Details: {selectedRound.round_id}
                </h3>
                <p className="text-xs text-[#6c7771]">
                  Aggregated on {selectedRound.finish_time} via FedAvg
                </p>
              </div>
              <button
                onClick={() => setSelectedRound(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Participating Sites */}
              <div>
                <h4 className="font-bold text-[#24332e] mb-2">Hospital Client Weights & Updates</h4>
                <div className="space-y-2">
                  {selectedRound.participating_sites.map((site) => (
                    <div key={site.site_id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-[#24332e]">{site.site_name}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {site.sample_count.toLocaleString()} local samples ({((site.sample_count / (selectedRound.total_samples || 128604)) * 100).toFixed(1)}% weight)
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-emerald-700 font-semibold block">Acc: {(site.local_accuracy * 100).toFixed(1)}%</span>
                        <span className="text-slate-600 text-[11px] block">Train Loss: {site.local_loss.toFixed(4)}</span>
                        <span className="text-slate-400 text-[10px]">Payload: {site.update_size_mb} MB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation Metrics */}
              <div>
                <h4 className="font-bold text-[#24332e] mb-2">Held-out Evaluation Test Performance</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-center">
                    <span className="text-[11px] text-emerald-800 block">Accuracy</span>
                    <strong className="text-sm text-emerald-900 font-mono">{(selectedRound.evaluation.accuracy * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-center">
                    <span className="text-[11px] text-blue-800 block">AUROC</span>
                    <strong className="text-sm text-blue-900 font-mono">{selectedRound.evaluation.auroc.toFixed(3)}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-100 text-center">
                    <span className="text-[11px] text-purple-800 block">F1 Score</span>
                    <strong className="text-sm text-purple-900 font-mono">{(selectedRound.evaluation.f1 * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              {/* Active Hyperparameters & Privacy Guarantees */}
              {selectedRound.hyperparameters && (
                <div>
                  <h4 className="font-bold text-[#24332e] mb-2">Configured Hyperparameters</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Local Epochs (E)</span>
                      <strong className="text-xs text-[#24332e] font-mono">{selectedRound.hyperparameters.localEpochs}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Learning Rate (&eta;)</span>
                      <strong className="text-xs text-[#24332e] font-mono">{selectedRound.hyperparameters.learningRate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Batch Size (B)</span>
                      <strong className="text-xs text-[#24332e] font-mono">{selectedRound.hyperparameters.batchSize}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Diff. Privacy</span>
                      <strong className="text-xs text-[#24332e] font-mono">
                        {selectedRound.hyperparameters.differentialPrivacy
                          ? `\u03b5=${selectedRound.hyperparameters.epsilon}`
                          : 'Disabled'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedRound(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#24332e] font-semibold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
