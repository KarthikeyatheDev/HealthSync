import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { HospitalsView } from './components/Views/HospitalsView';
import { RoundsView } from './components/Views/RoundsView';
import { PerformanceView } from './components/Views/PerformanceView';
import { LogsView } from './components/Views/LogsView';
import { SettingsView } from './components/Views/SettingsView';
import { DataFlowPrivacy } from './components/DataFlowPrivacy';

import {
  DashboardData,
  RoundRecord,
  ActivityLog,
  PredictionTask,
  SSEEvent
} from './types';
import {
  getDashboard,
  getRounds,
  getLogs,
  startRound,
  subscribeToEvents
} from './lib/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeTask, setActiveTask] = useState<PredictionTask>('heart');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isStartingRound, setIsStartingRound] = useState<boolean>(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [rounds, setRounds] = useState<RoundRecord[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Fetch Authoritative State
  const fetchData = useCallback(async (taskToFetch = activeTask) => {
    try {
      const [dash, rList, lList] = await Promise.all([
        getDashboard(taskToFetch),
        getRounds(taskToFetch),
        getLogs()
      ]);
      setDashboardData(dash);
      setRounds(rList);
      setLogs(lList);
      setIsOnline(true);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setIsOnline(false);
    }
  }, [activeTask]);

  // Initial Load & On Task Change
  useEffect(() => {
    fetchData(activeTask);
  }, [activeTask, fetchData]);

  // Real-Time EventSource (SSE) Subscription
  useEffect(() => {
    const unsubscribe = subscribeToEvents(
      (event: SSEEvent) => {
        setIsOnline(true);

        // Update dashboard state reactively from SSE
        setDashboardData((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };

          if (event.type === 'round_started') {
            updated.is_training_active = true;
            updated.active_round_id = event.round_id || null;
            updated.aggregation_step = 'local_training';
            updated.sites = updated.sites.map(s => ({
              ...s,
              status: 'training',
              progressPercent: 10
            }));
          } else if (event.type === 'local_training_progress' && event.site_id) {
            updated.sites = updated.sites.map(s => 
              s.id === event.site_id ? { ...s, progressPercent: event.progress || 50 } : s
            );
          } else if (event.type === 'local_training_completed' && event.site_id) {
            updated.sites = updated.sites.map(s => 
              s.id === event.site_id ? { ...s, status: 'update_ready', progressPercent: 100 } : s
            );
            updated.aggregation_step = 'updates_received';
          } else if (event.type === 'aggregation_started') {
            updated.aggregation_step = 'aggregating';
            updated.sites = updated.sites.map(s => ({ ...s, status: 'aggregated' }));
          } else if (event.type === 'global_model_updated' && event.version) {
            updated.global_model = {
              ...updated.global_model,
              version: event.version,
              lastUpdated: 'Just now'
            };
          } else if (event.type === 'evaluation_completed' && event.metrics) {
            const acc = event.metrics.accuracy || 0.92;
            const delta = acc - updated.global_model.accuracy;
            updated.global_model = {
              ...updated.global_model,
              accuracy: acc,
              delta: delta,
              loss: event.metrics.loss || 0.2,
              f1: event.metrics.f1 || 0.9,
              auroc: event.metrics.auroc || 0.95
            };
          } else if (event.type === 'round_completed') {
            updated.is_training_active = false;
            updated.active_round_id = null;
            updated.aggregation_step = 'completed';
            updated.completed_rounds += 1;
            updated.current_round += 1;
          } else if (event.type === 'round_failed') {
            updated.is_training_active = false;
            updated.active_round_id = null;
            updated.aggregation_step = 'idle';
          }

          return updated;
        });

        // Append to local activity feed
        if (event.message) {
          const now = new Date();
          const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const isSuccess = event.type.includes('completed') || event.type.includes('updated');
          const isError = event.type.includes('failed');

          setLogs((prev) => [
            {
              id: `log_${Date.now()}_${Math.random()}`,
              timestamp: new Date().toISOString(),
              timeFormatted: timeFormatted,
              type: event.type,
              message: event.message!,
              level: isError ? 'error' : isSuccess ? 'success' : 'info',
              site_id: event.site_id,
              round_id: event.round_id
            },
            ...prev
          ]);
        }

        // When round finishes, sync complete rounds history
        if (event.type === 'round_completed' || event.type === 'round_failed') {
          fetchData(activeTask);
        }
      },
      (connected) => {
        setIsOnline(connected);
      }
    );

    return () => unsubscribe();
  }, [activeTask, fetchData]);

  // Start Federated Training Round
  const handleStartRound = async () => {
    if (dashboardData?.is_training_active || isStartingRound) return;
    setIsStartingRound(true);

    try {
      const res = await startRound(activeTask);
      console.log('Started federated round:', res);
      // Immediately set UI into active training state
      setDashboardData(prev => prev ? ({
        ...prev,
        is_training_active: true,
        active_round_id: res.round_id,
        aggregation_step: 'local_training',
        sites: prev.sites.map(s => ({ ...s, status: 'training', progressPercent: 10 }))
      }) : null);
    } catch (err: any) {
      console.error('Error starting round:', err);
      alert(err.message || 'Could not start federated round');
    } finally {
      setIsStartingRound(false);
    }
  };

  const handleTaskChange = (newTask: PredictionTask) => {
    if (dashboardData?.is_training_active) return;
    setActiveTask(newTask);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2] flex flex-col font-sans">
      {/* Top Header */}
      <Header isOnline={isOnline} />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content View Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              rounds={rounds}
              logs={logs}
              activeTask={activeTask}
              onTaskChange={handleTaskChange}
              onStartRound={handleStartRound}
              isStartingRound={isStartingRound}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'hospitals' && (
            <HospitalsView sites={dashboardData?.sites || []} />
          )}

          {activeTab === 'rounds' && (
            <RoundsView
              rounds={rounds}
              activeTask={activeTask}
              onTaskChange={handleTaskChange}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceView
              data={dashboardData}
              rounds={rounds}
              activeTask={activeTask}
              onTaskChange={handleTaskChange}
            />
          )}

          {activeTab === 'dataflow' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-[#24332e] tracking-tight">Data Flow &amp; Privacy Architecture</h1>
                <p className="text-xs text-[#6c7771] mt-1">
                  How patient health records remain strictly confidential while training global diagnostic models.
                </p>
              </div>
              <DataFlowPrivacy />
            </div>
          )}

          {activeTab === 'logs' && (
            <LogsView logs={logs} onRefresh={() => fetchData(activeTask)} />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
};
