import type { ConnectionMode, ConnectionStatus } from '../types/sensor';
import { Cpu, Volume2, VolumeX, Activity } from 'lucide-react';

interface NavbarProps {
  mode: ConnectionMode;
  status: ConnectionStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHardwareModal: () => void;
  onToggleMode: (newMode: ConnectionMode) => void;
  isRiskTriggered: boolean;
  hasRealData: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  status,
  soundEnabled,
  onToggleSound,
  onOpenHardwareModal,
  onToggleMode,
  isRiskTriggered,
  hasRealData,
}) => {
  // Determine connection status badge
  const renderStatusBadge = () => {
    if (mode === 'demo') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/25 text-emerald-300 text-xs font-mono font-medium shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="tracking-wide">DEMO MODE</span>
          <span className="text-[10px] text-emerald-400/70 border-l border-emerald-500/20 pl-1.5 uppercase">Simulated</span>
        </div>
      );
    }

    if (status === 'connected') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-semibold tracking-wide">CONNECTED</span>
          {hasRealData && (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded">
              <Activity className="w-2.5 h-2.5 animate-pulse text-emerald-300" />
              LIVE STREAM
            </span>
          )}
        </div>
      );
    }

    if (status === 'waiting_for_data') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>WAITING FOR DATA</span>
        </div>
      );
    }

    if (status === 'stale') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/70 border border-amber-600/40 text-amber-200 text-xs font-mono font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
          <span>DATA STALE (&gt;10s)</span>
        </div>
      );
    }

    if (status === 'connecting') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          <span>CONNECTING...</span>
        </div>
      );
    }

    // Default disconnected
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400 text-xs font-mono font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-500"></span>
        <span>DISCONNECTED</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/50 bg-[#050b07]/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative group flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-950 to-emerald-900/70 border border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-transform group-hover:scale-105">
            {/* Custom MosqGuard Logo Icon */}
            <svg
              className="w-6 h-6 text-emerald-400 transition-colors group-hover:text-emerald-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Shield boundary */}
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeOpacity="0.4" fill="rgba(16,185,129,0.06)" />
              {/* Mosquito probe / needle */}
              <path d="M12 7v5" stroke="#34d399" />
              {/* Mosquito thorax */}
              <circle cx="12" cy="12" r="1.5" fill="#10b981" />
              {/* Translucent angled wings */}
              <path d="m8 10 4 2-4 2" stroke="#6ee7b7" strokeWidth="1.5" strokeOpacity="0.75" />
              <path d="m16 10-4 2 4 2" stroke="#6ee7b7" strokeWidth="1.5" strokeOpacity="0.75" />
            </svg>
            {isRiskTriggered && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Mosq<span className="text-emerald-400">Guard</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 font-mono">
                IoT Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-normal">
              IoT Monitoring System
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="hidden md:flex items-center bg-[#0a140f] border border-emerald-900/50 rounded-xl p-1 text-xs">
            <button
              onClick={() => onToggleMode('demo')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                mode === 'demo'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Demo Mode
            </button>
            <button
              onClick={() => onToggleMode('serial')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                mode !== 'demo'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Live Hardware
            </button>
          </div>

          {/* Connection Status Badge */}
          {renderStatusBadge()}

          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
            title={soundEnabled ? 'Alert chime is enabled (Click to mute)' : 'Alert chime is muted (Click to enable)'}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Arduino Hardware Setup Trigger */}
          <button
            onClick={onOpenHardwareModal}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 text-xs font-medium transition-all shadow-sm"
          >
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Arduino Uno R3</span>
          </button>
        </div>
      </div>
    </header>
  );
};
