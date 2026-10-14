import React, { useState } from 'react';
import { FileText, Search, Filter, RefreshCw } from 'lucide-react';
import { ActivityLog } from '../../types';

interface LogsViewProps {
  logs: ActivityLog[];
  onRefresh: () => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#24332e] tracking-tight">System & Orchestration Logs</h1>
          <p className="text-xs text-[#6c7771] mt-1">
            Real-time telemetry and audit records for federated training rounds, model gradient uploads, and aggregation events.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-xs font-semibold text-[#24332e] hover:bg-slate-50 flex items-center space-x-1.5 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="clinical-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search events, hospitals, rounds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500">Filter Level:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="clinical-card overflow-hidden">
        <div className="divide-y divide-[#e2e8f0] font-mono text-xs max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-[#6c7771] italic">No logs found matching criteria.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start space-x-3">
                <span className="text-slate-400 text-[11px] shrink-0 w-12">{log.timeFormatted}</span>
                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                  log.level === 'success' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : log.level === 'error'
                    ? 'bg-rose-100 text-rose-800'
                    : log.level === 'warning'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {log.level}
                </span>
                <span className="text-[#24332e] flex-1 break-words font-sans">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
