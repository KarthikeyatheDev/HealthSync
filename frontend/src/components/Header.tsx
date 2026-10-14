import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isOnline }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      setCurrentTime(now.toLocaleDateString('en-US', options).replace(',', ''));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-[#0d9488] flex items-center justify-center text-white shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-[#24332e] tracking-tight">HealthSync</span>
          </div>
          <p className="text-xs text-[#6c7771] -mt-0.5">Federated Learning for Better Healthcare</p>
        </div>
      </div>

      {/* Right status items */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-dot' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-medium text-[#24332e]">
            {isOnline ? 'System Online' : 'Connecting...'}
          </span>
        </div>

        <div className="text-xs text-[#6c7771] font-mono font-medium hidden sm:block">
          {currentTime || 'Oct 26, 2026 19:42'}
        </div>

        {/* User initials circle */}
        <div className="w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-xs font-semibold shadow-sm cursor-pointer hover:bg-[#334155] transition-colors">
          AS
        </div>
      </div>
    </header>
  );
};
