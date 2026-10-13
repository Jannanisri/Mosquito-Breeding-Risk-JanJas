import type { ConnectionMode, ConnectionStatus } from '../types/sensor';
import { ArrowDown, Cpu, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  mode: ConnectionMode;
  status: ConnectionStatus;
  isRiskTriggered: boolean;
  onScrollToCards: () => void;
  onOpenHardwareModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  mode,
  status,
  isRiskTriggered,
  onScrollToCards,
  onOpenHardwareModal,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-emerald-950/40">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-emerald-600/5 rounded-full blur-[90px] pointer-events-none" />
      {isRiskTriggered && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none transition-all duration-1000" />
      )}

      {/* Decorative environmental subtle radar grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#091a1112_1px,transparent_1px),linear-gradient(to_bottom,#091a1112_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/20 text-emerald-300 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monitor Stagnant Water. Identify Risk. Act Early.</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Stay Ahead of{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                Mosquito Breeding.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Monitor environmental conditions and identify temperature-based mosquito-breeding risk with your{' '}
              <span className="text-white font-medium">MosqGuard</span> device.
            </p>

            {/* Hardware Status Tag & Local Control Note */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0a150f] border border-emerald-900/60 text-xs text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Arduino Uno R3 • DHT11 Sensor • {mode === 'demo' ? 'Demo Telemetry' : status.toUpperCase()}</span>
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1812] border border-emerald-950 text-xs text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>LED (D7) and buzzer (D8) are controlled locally by the Arduino.</span>
              </div>
            </div>


            {/* Call to Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onScrollToCards}
                className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-semibold text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
              >
                <span>View Live Readings</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </button>

              <button
                onClick={onOpenHardwareModal}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#09150e] hover:bg-[#0d1e14] border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-300 font-medium text-sm transition-all"
              >
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Inspect Hardware &amp; Code</span>
              </button>
            </div>
          </div>

          {/* Right Column: Animated Decorative Mosquito Radar Illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Outer pulsing radar ring */}
              <div className="absolute inset-0 rounded-full border border-emerald-500/15 animate-[spin_25s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-emerald-500/10" />
              <div className="absolute inset-12 rounded-full border border-dashed border-emerald-500/20 animate-[spin_40s_linear_infinite_reverse]" />
              <div className="absolute inset-20 rounded-full bg-gradient-to-br from-emerald-950/40 to-[#050b07] border border-emerald-500/30 backdrop-blur-sm" />

              {/* Decorative Mosquito Silhouette Graphics */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
                  <svg
                    className={`w-28 h-28 transition-transform duration-700 ${
                      isRiskTriggered ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    }`}
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Proboscis */}
                    <line x1="50" y1="12" x2="50" y2="28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Head */}
                    <circle cx="50" cy="32" r="5" fill="currentColor" />
                    <circle cx="47" cy="30" r="1.5" fill="#ffffff" />
                    <circle cx="53" cy="30" r="1.5" fill="#ffffff" />

                    {/* Thorax */}
                    <ellipse cx="50" cy="44" rx="7" ry="9" fill="currentColor" />

                    {/* Abdomen segments */}
                    <path
                      d="M50 53 C46 60, 45 74, 50 86 C55 74, 54 60, 50 53 Z"
                      fill="currentColor"
                      fillOpacity="0.85"
                    />

                    {/* Translucent Wings with flutter effect */}
                    <path
                      d="M45 40 C25 22, 10 38, 42 49 Z"
                      fill="rgba(110, 231, 183, 0.45)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="origin-[45px_40px] animate-[pulse_3s_ease-in-out_infinite]"
                    />
                    <path
                      d="M55 40 C75 22, 90 38, 58 49 Z"
                      fill="rgba(110, 231, 183, 0.45)"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="origin-[55px_40px] animate-[pulse_3s_ease-in-out_infinite]"
                    />

                    {/* Forelegs */}
                    <path d="M46 36 L24 28 M54 36 L76 28" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                    {/* Midlegs */}
                    <path d="M44 44 L16 46 M56 44 L84 46" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                    {/* Hindlegs */}
                    <path d="M45 50 L20 74 M55 50 L80 74" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                  </svg>

                  {/* Scientific Target Grid Reticle Overlay */}
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-emerald-400/60 uppercase">
                    ID: MOSQ-11
                  </div>
                  <div className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-400/60">
                    25.0°C THRESHOLD
                  </div>
                </div>

                {/* Status indicator underneath */}
                <div className="mt-3 flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${isRiskTriggered ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                  <span>{isRiskTriggered ? 'ELEVATED BIO-RISK' : 'OPTIMAL BASELINE'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
