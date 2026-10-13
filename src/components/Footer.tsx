import { Cpu } from 'lucide-react';


export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-emerald-950/60 bg-[#040805] text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 7v5" stroke="#34d399" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">
                Mosq<span className="text-emerald-400">Guard</span>
              </span>
              <p className="text-xs text-slate-500">
                Environmental Risk Monitoring Prototype
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/80 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Arduino Uno R3 • DHT11 • LED D7 • Buzzer D8</span>
          </div>
        </div>

        {/* Prototype scientific limitation disclaimer */}
        <div className="p-4 rounded-2xl bg-[#07110b] border border-emerald-950/80 text-xs text-slate-400 leading-relaxed text-center sm:text-left">
          <p className="font-medium text-slate-300">
            Disclaimer: Temperature-based alerts are indicative and do not confirm mosquito breeding.
          </p>
          <p className="text-slate-500 text-[11px] mt-1">
            This platform serves as an academic engineering prototype. Physical breeding requires stagnant water pools, vector presence, and incubation cycles.
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 border-t border-emerald-950/40">
          <span>&copy; {new Date().getFullYear()} MosqGuard IoT Platform. All rights reserved.</span>
          <span className="font-mono text-[11px] text-slate-600">College Engineering Project Prototype</span>
        </div>
      </div>
    </footer>
  );
};
