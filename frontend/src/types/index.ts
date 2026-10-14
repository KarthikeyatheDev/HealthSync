export type PredictionTask = 'heart' | 'diabetes';

export type SiteStatus = 'ready' | 'training' | 'update_ready' | 'aggregated' | 'error';

export interface HospitalSite {
  id: string;
  name: string;
  location: string;
  records: number;
  status: SiteStatus;
  version: string;
  updateSizeMb?: number;
  progressPercent?: number;
  lastMetrics?: {
    accuracy: number;
    loss: number;
    precision?: number;
    recall?: number;
    f1?: number;
  };
}

export interface GlobalModelInfo {
  version: string;
  task: PredictionTask;
  lastUpdated: string;
  accuracy: number;
  prevAccuracy?: number;
  delta?: number;
  loss: number;
  precision: number;
  recall: number;
  f1: number;
  auroc: number;
}

export interface DashboardData {
  project: string;
  network_status: string;
  sites_count: number;
  completed_rounds: number;
  current_round: number;
  active_task: PredictionTask;
  global_model: GlobalModelInfo;
  sites: HospitalSite[];
  is_training_active: boolean;
  active_round_id?: string | null;
  aggregation_step: 'idle' | 'local_training' | 'updates_received' | 'aggregating' | 'completed';
}

export interface RoundRecord {
  round_id: string;
  task: PredictionTask;
  round_number?: number;
  start_time: string;
  finish_time: string;
  status: 'completed' | 'failed' | 'in_progress';
  global_model_version: string;
  participating_sites: {
    site_id: string;
    site_name: string;
    location?: string;
    sample_count: number;
    local_accuracy: number;
    local_loss: number;
    update_size_mb: number;
  }[];
  evaluation: {
    accuracy: number;
    loss: number;
    precision: number;
    recall: number;
    f1: number;
    auroc: number;
    confusion_matrix?: number[][];
    test_samples: number;
  };
  duration_seconds: number;
  total_samples?: number;
  method?: string;
  hyperparameters?: Record<string, any>;
  task_evaluations?: Record<string, any>;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  type: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  site_id?: string;
  round_id?: string;
}

export interface SSEEvent {
  type: string;
  round_id?: string;
  task?: PredictionTask;
  site_id?: string;
  site_name?: string;
  progress?: number;
  version?: string;
  metrics?: Record<string, number>;
  message?: string;
  timestamp?: string;
}

export interface PredictionResult {
  task: PredictionTask;
  risk_score: number;
  risk_level: 'Low Risk' | 'Medium Risk' | 'High Risk';
  confidence: number;
  model_version: string;
  recommendations: string[];
}

export interface FeatureAttribution {
  feature: string;
  displayName: string;
  unit: string;
  category: string;
  value: number;
  normalRange: string;
  modifiable: boolean;
  attribution: number;
  attributionPercent: number;
  effect: 'risk_driver' | 'protective' | 'neutral';
}

export interface RecourseSuggestion {
  feature: string;
  displayName: string;
  currentValue: string;
  targetValue: string;
  action: string;
  estimatedRiskReduction: string;
}

export interface PatientExplanation {
  task: PredictionTask;
  base_risk: number;
  predicted_risk: number;
  risk_shift: number;
  threshold: number;
  is_elevated: boolean;
  features: FeatureAttribution[];
  top_drivers: FeatureAttribution[];
  top_protective: FeatureAttribution[];
  recourse_suggestions: RecourseSuggestion[];
}

export interface GlobalFeatureRanking {
  feature: string;
  displayName: string;
  category: string;
  importance: number;
  percentage: number;
  rank: number;
}

export interface GlobalFeatureImportance {
  task: PredictionTask;
  feature_count: number;
  rankings: GlobalFeatureRanking[];
  top_feature: string;
}

export interface PatientPreset {
  id: string;
  name: string;
  task: PredictionTask;
  description: string;
  features: Record<string, number>;
}

