import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldAlert, Cpu, Lock, Check, Loader2 } from 'lucide-react';
import { getSettings, updateSettings } from '../../lib/api';

export const SettingsView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [learningRate, setLearningRate] = useState('0.001');
  const [batchSize, setBatchSize] = useState('256');
  const [localEpochs, setLocalEpochs] = useState('10');
  const [differentialPrivacy, setDifferentialPrivacy] = useState(false);
  const [epsilon, setEpsilon] = useState('1.2');

  // Load authoritative settings from backend on mount
  useEffect(() => {
    setIsLoading(true);
    getSettings()
      .then((cfg) => {
        if (cfg.learningRate !== undefined) setLearningRate(String(cfg.learningRate));
        if (cfg.batchSize !== undefined) setBatchSize(String(cfg.batchSize));
        if (cfg.localEpochs !== undefined) setLocalEpochs(String(cfg.localEpochs));
        if (cfg.differentialPrivacy !== undefined) setDifferentialPrivacy(Boolean(cfg.differentialPrivacy));
        if (cfg.epsilon !== undefined) setEpsilon(String(cfg.epsilon));
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSettings({
        learningRate,
        batchSize,
        localEpochs,
        differentialPrivacy,
        epsilon
      });
      console.log('Saved settings to backend:', res);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      alert('Failed to save configuration to backend: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-[#24332e] tracking-tight">Federated Network Settings</h1>
        <p className="text-xs text-[#6c7771] mt-1">
          Configure federated optimization hyperparameters, aggregation schedule, and privacy guarantees.
        </p>
      </div>

      <div className="clinical-card p-6 space-y-6 text-xs">
        {/* Section 1: Optimization Parameters */}
        <div>
          <h2 className="text-sm font-bold text-[#24332e] flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#315c4b]" />
            <span>Client Optimization Hyperparameters</span>
          </h2>
          <p className="text-[#6c7771] text-[11px] mt-0.5">
            Parameters configured for local client gradient descent before FedAvg parameter synchronization.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-[#24332e] font-semibold mb-1">Local Learning Rate (&eta;)</label>
              <input
                type="text"
                disabled={isLoading || isSaving}
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 0.001</span>
            </div>

            <div>
              <label className="block text-[#24332e] font-semibold mb-1">Local Batch Size (B)</label>
              <input
                type="text"
                disabled={isLoading || isSaving}
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 256 samples</span>
            </div>

            <div>
              <label className="block text-[#24332e] font-semibold mb-1">Local Epochs (E)</label>
              <input
                type="text"
                disabled={isLoading || isSaving}
                value={localEpochs}
                onChange={(e) => setLocalEpochs(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 3 epochs / round</span>
            </div>
          </div>
        </div>

        {/* Section 2: Privacy Configuration */}
        <div className="pt-5 border-t border-slate-100">
          <h2 className="text-sm font-bold text-[#24332e] flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#315c4b]" />
            <span>Differential Privacy &amp; Secure Aggregation</span>
          </h2>
          <p className="text-[#6c7771] text-[11px] mt-0.5">
            Formal mathematical privacy guarantees to mitigate model gradient reconstruction attacks.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                disabled={isLoading || isSaving}
                checked={differentialPrivacy}
                onChange={(e) => setDifferentialPrivacy(e.target.checked)}
                className="w-4 h-4 text-[#315c4b] rounded"
              />
              <span className="font-semibold text-[#24332e]">Enable Gaussian Gradient Noise Perturbation (DP-FedAvg)</span>
            </label>

            <div className="max-w-xs pl-6">
              <label className="block text-[#24332e] font-semibold mb-1">Target Privacy Budget (&epsilon;)</label>
              <input
                type="text"
                disabled={isLoading || isSaving}
                value={epsilon}
                onChange={(e) => setEpsilon(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Strict clinical protection: &epsilon; &le; 1.5</span>
            </div>
          </div>
        </div>

        {/* Section 3: Save button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isLoading ? 'Loading network configuration...' : 'Changes apply immediately to subsequent federated rounds.'}
          </span>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="px-4 py-2 bg-[#315c4b] hover:bg-[#264a3b] disabled:bg-slate-300 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Configuration Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
