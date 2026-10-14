import React from 'react';
import { ActivityLog } from '../types';
import { ArrowRight } from 'lucide-react';

interface RecentActivityProps {
  logs: ActivityLog[];
  onViewAllLogs: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs, onViewAllLogs }) => {
  const displayLogs = logs.slice(0, 6);

  const getDotColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-emerald-500 ring-emerald-100';
      case 'warning':
        return 'bg-amber-500 ring-amber-100';
      case 'error':
        return 'bg-red-500 ring-red-100';
      default:
        return 'bg-blue-500 ring-blue-100';
    }
  };

  return (
    <div className="clinical-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#24332e] tracking-tight">Recent Activity</h2>
          <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot"></span>
            <span>Live</span>
          </span>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="my-5 space-y-4">
        {displayLogs.length === 0 ? (
          <p className="text-xs text-[#6c7771] italic text-center py-6">Waiting for training events...</p>
        ) : (
          displayLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 text-xs">
              <span className="font-mono text-[#6c7771] text-[11px] shrink-0 w-11 mt-0.5">
                {log.timeFormatted}
              </span>
              <div className="relative mt-1.5 shrink-0">
                <span className={`block w-2 h-2 rounded-full ring-4 ${getDotColor(log.level)}`}></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#24332e] font-medium leading-snug break-words">
                  {log.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-[#e2e8f0]">
        <button
          onClick={onViewAllLogs}
          className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] flex items-center space-x-1 transition-colors"
        >
          <span>View all logs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
