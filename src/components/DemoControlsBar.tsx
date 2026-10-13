import React from 'react';
import { Sliders, Play, Pause } from 'lucide-react';


interface DemoControlsBarProps {
  currentTemp: number | null;
  currentHum: number | null;
  isAutoFluctuate: boolean;
  onApplySample: (temp: number | null, hum: number | null, isValid?: boolean) => void;
  onToggleFluctuate: (enabled: boolean) => void;
}

export const DemoControlsBar: React.FC<DemoControlsBarProps> = ({
  currentTemp,
  currentHum,
  isAutoFluctuate,
  onApplySample,
  onToggleFluctuate,
}) => {
  return (
    <div className="rounded-3xl bg-[#09150e]/90 border border-emerald-500/20 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.08)] space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Interactive Demonstration Controls
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Demo Data Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Test and verify the temperature-based risk detection logic without connecting physical hardware.
            </p>
          </div>
        </div>

        {/* Ambient drift toggle */}
        <button
          onClick={() => onToggleFluctuate(!isAutoFluctuate)}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            isAutoFluctuate
              ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAutoFluctuate ? (
            <>
              <Pause className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ambient Drift: Active</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-slate-400" />
              <span>Ambient Drift: Paused</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Quick Demonstration Buttons */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Quick Rule Test Scenarios:</span>
          <span className="text-emerald-400 text-[11px]">Threshold = 25.0 °C</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Preset 1: High Risk */}
          <button
            onClick={() => onApplySample(28.4, 72, true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#141209] hover:bg-[#1a170c] border border-amber-500/30 hover:border-amber-400/50 text-left transition-all group"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0 group-hover:scale-125 transition-transform" />
            <div>
              <div className="text-xs font-bold text-amber-200">High Risk (&gt;25°C)</div>
              <div className="text-[11px] font-mono text-slate-400">28.4°C • 72%</div>
            </div>
          </button>

          {/* Preset 2: Safe */}
          <button
            onClick={() => onApplySample(22.2, 58, true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#09150e] hover:bg-[#0d1e14] border border-emerald-500/20 hover:border-emerald-400/40 text-left transition-all group"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0 group-hover:scale-125 transition-transform" />
            <div>
              <div className="text-xs font-bold text-emerald-200">Safe (&lt;25°C)</div>
              <div className="text-[11px] font-mono text-slate-400">22.2°C • 58%</div>
            </div>
          </button>

          {/* Preset 3: Exact 25.0°C Boundary Test */}
          <button
            onClick={() => onApplySample(25.0, 64, true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#121611] hover:bg-[#172016] border border-emerald-400/30 hover:border-amber-400/40 text-left transition-all group"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0 group-hover:scale-125 transition-transform" />
            <div>
              <div className="text-xs font-bold text-white">Exact Boundary</div>
              <div className="text-[11px] font-mono text-amber-300">25.0°C → Alert</div>
            </div>
          </button>

          {/* Preset 4: Invalid / Missing Sensor Reading */}
          <button
            onClick={() => onApplySample(null, null, false)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#0f1113] hover:bg-[#15181b] border border-slate-700 hover:border-slate-600 text-left transition-all group"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
            <div>
              <div className="text-xs font-bold text-slate-300">Faulty / Missing</div>
              <div className="text-[11px] font-mono text-slate-400">Null → Waiting</div>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Fine-Tuning Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Temperature Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Manual Temperature Tuning:</span>
            <span className="text-emerald-300 font-bold">
              {currentTemp !== null ? `${currentTemp.toFixed(1)} °C` : 'Null'}
            </span>
          </div>
          <input
            type="range"
            min="16.0"
            max="38.0"
            step="0.1"
            value={currentTemp !== null ? currentTemp : 25.0}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onApplySample(val, currentHum !== null ? currentHum : 65, true);
            }}
            className="w-full accent-emerald-400 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer border border-emerald-950"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>16.0°C (Cold)</span>
            <span className="text-amber-400 font-semibold">25.0°C Boundary</span>
            <span>38.0°C (Tropical)</span>
          </div>
        </div>

        {/* Humidity Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Manual Humidity Tuning:</span>
            <span className="text-teal-300 font-bold">
              {currentHum !== null ? `${Math.round(currentHum)} %` : 'Null'}
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="95"
            step="1"
            value={currentHum !== null ? currentHum : 65}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onApplySample(currentTemp !== null ? currentTemp : 26.0, val, true);
            }}
            className="w-full accent-teal-400 h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer border border-emerald-950"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>20% (Dry)</span>
            <span>65% (Typical)</span>
            <span>95% (High Humidity)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
