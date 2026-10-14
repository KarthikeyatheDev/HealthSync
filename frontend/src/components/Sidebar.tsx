import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  RotateCcw, 
  LineChart, 
  Share2, 
  FileText, 
  Settings, 
  ShieldCheck, 
  ChevronDown 
} from 'lucide-react';

export type NavTab = 'dashboard' | 'hospitals' | 'rounds' | 'performance' | 'dataflow' | 'logs' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'hospitals', label: 'Hospitals', icon: <Building2 className="w-4 h-4" /> },
    { id: 'rounds', label: 'Training Rounds', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'performance', label: 'Model Performance', icon: <LineChart className="w-4 h-4" /> },
    { id: 'dataflow', label: 'Data Flow', icon: <Share2 className="w-4 h-4" /> },
    { id: 'logs', label: 'Logs', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col justify-between p-4 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:shrink-0 z-20">
      {/* Navigation links - scrollable if viewport height is compact */}
      <div className="space-y-1 overflow-y-auto flex-1 pr-1 pb-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#e8eef4] text-[#2563eb] font-semibold'
                  : 'text-[#6c7771] hover:text-[#24332e] hover:bg-[#f8fafc]'
              }`}
            >
              <span className={isActive ? 'text-[#2563eb]' : 'text-[#6c7771]'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom widgets - Persistently pinned across all pages */}
      <div className="space-y-3.5 pt-4 border-t border-[#e2e8f0] shrink-0 mt-auto bg-white">
        {/* Privacy callout */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3.5 text-xs shadow-sm">
          <div className="flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 leading-snug">Your data stays with your hospital.</p>
              <p className="text-emerald-700 text-[11px] mt-0.5 leading-relaxed font-medium">
                Only model updates are shared.
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100 cursor-pointer transition-all">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#315c4b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              AS
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#24332e] leading-tight">Amar Singh</p>
              <p className="text-[11px] text-[#6c7771] leading-tight font-medium">Researcher</p>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#6c7771]" />
        </div>
      </div>
    </aside>
  );
};
