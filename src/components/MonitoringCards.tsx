import React, { useEffect, useState } from 'react';
import {
  Thermometer,
  Droplets,
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import type { SensorReading, RiskAssessment } from '../types/sensor';
import { formatTemperature, formatHumidity, formatTimestamp, RISK_TRIGGER_THRESHOLD } from '../utils/riskLogic';


interface MonitoringCardsProps {
  reading: SensorReading;
  risk: RiskAssessment;
  isDemo: boolean;
}

export const MonitoringCards: React.FC<MonitoringCardsProps> = ({
  reading,
  risk,
  isDemo,
}) => {
  // Animation triggers when readings update
  const [tempUpdated, setTempUpdated] = useState(false);
  const [humUpdated, setHumUpdated] = useState(false);

  useEffect(() => {
    setTempUpdated(true);
    const timer = setTimeout(() => setTempUpdated(false), 800);
    return () => clearTimeout(timer);
  }, [reading.temperature]);

  useEffect(() => {
    setHumUpdated(true);
    const timer = setTimeout(() => setHumUpdated(false), 800);
    return () => clearTimeout(timer);
  }, [reading.humidity]);

  const tempVal = reading.temperature;
  const humVal = reading.humidity;
  const isTriggered = risk.isTriggered;
  const isWaiting = risk.level === 'WAITING_FOR_DATA';

  // Calculate percentage for subtle thermal bar (0 to 50°C scale typical for DHT11)
  const tempPercent = tempVal !== null ? Math.min(100, Math.max(0, (tempVal / 45) * 100)) : 0;
  const humPercent = humVal !== null ? Math.min(100, Math.max(0, humVal)) : 0;

  return (
    <div id="monitoring-section" className="space-y-6 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Monitored Parameters</span>
            {isDemo && (
              <span className="bg-amber-950/80 text-amber-300 border border-amber-600/30 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-normal">
                Demo Data
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Real-Time Environmental Readings
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last reading: {formatTimestamp(reading.timestamp)}</span>
        </div>
      </div>

      {/* Exactly Three Monitoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* =========================================================================
            CARD 1 — TEMPERATURE
        ========================================================================= */}
        <div className="relative group rounded-3xl bg-[#08130d]/80 backdrop-blur-xl border border-emerald-500/15 p-7 transition-all duration-300 hover:border-emerald-500/35 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] flex flex-col justify-between overflow-hidden">
          {/* Subtle background ambient corner glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top: Icon & Label */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Temperature
              </span>
              <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 transition-colors group-hover:text-emerald-300">
                <Thermometer className="w-5 h-5" />
              </div>
            </div>

            {/* Large Numerical Value */}
            <div className="mt-6 flex items-baseline gap-2">
              <span
                className={`text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-white transition-all duration-300 ${
                  tempUpdated ? 'text-emerald-300 scale-105' : ''
                }`}
              >
                {formatTemperature(tempVal)}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-slate-400 font-mono">
                °C
              </span>
            </div>

            {/* Threshold indicator marker */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0 °C</span>
                <span className="text-amber-400 font-medium">Risk Threshold: ≥25.0 °C</span>
                <span>45 °C</span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800">
                {/* 25°C vertical threshold marker line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  style={{ left: `${(RISK_TRIGGER_THRESHOLD / 45) * 100}%` }}
                  title="25°C Mosquito breeding risk threshold"
                />
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    tempVal !== null && tempVal >= RISK_TRIGGER_THRESHOLD
                      ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${tempPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card Bottom: Timestamp & Sensor Spec */}
          <div className="mt-8 pt-4 border-t border-emerald-950/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatTimestamp(reading.timestamp)}
            </span>
            <span className="text-[11px] text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded">
              DHT11 Sensor
            </span>
          </div>
        </div>

        {/* =========================================================================
            CARD 2 — HUMIDITY
        ========================================================================= */}
        <div className="relative group rounded-3xl bg-[#08130d]/80 backdrop-blur-xl border border-emerald-500/15 p-7 transition-all duration-300 hover:border-emerald-500/35 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] flex flex-col justify-between overflow-hidden">
          {/* Subtle background ambient corner glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top: Icon & Label */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Humidity
              </span>
              <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 transition-colors group-hover:text-emerald-300">
                <Droplets className="w-5 h-5" />
              </div>
            </div>

            {/* Large Numerical Value */}
            <div className="mt-6 flex items-baseline gap-2">
              <span
                className={`text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-white transition-all duration-300 ${
                  humUpdated ? 'text-teal-300 scale-105' : ''
                }`}
              >
                {formatHumidity(humVal)}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-slate-400 font-mono">
                %
              </span>
            </div>

            {/* Humidity Level Meter */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>0% (Dry)</span>
                <span className="text-teal-400 font-medium">Ambient Moisture</span>
                <span>100% (Saturated)</span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
                  style={{ width: `${humPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card Bottom: Timestamp & Sensor Spec */}
          <div className="mt-8 pt-4 border-t border-emerald-950/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatTimestamp(reading.timestamp)}
            </span>
            <span className="text-[11px] text-teal-400/80 bg-teal-950/40 px-2 py-0.5 rounded">
              DHT11 Sensor
            </span>
          </div>
        </div>

        {/* =========================================================================
            CARD 3 — MOSQUITO BREEDING RISK (VISUAL FOCAL POINT)
        ========================================================================= */}
        <div
          className={`relative group rounded-3xl p-7 transition-all duration-500 flex flex-col justify-between overflow-hidden md:col-span-2 lg:col-span-1 ${
            isTriggered
              ? 'bg-[#151108]/90 border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.22)]'
              : isWaiting
              ? 'bg-[#0a0f0d]/90 border border-slate-700/60 shadow-none'
              : 'bg-[#08150e]/90 border-2 border-emerald-500/35 shadow-[0_0_35px_rgba(16,185,129,0.15)]'
          }`}
        >
          {/* Restrained glowing background accent */}
          {isTriggered && (
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
          )}

          <div>
            {/* Header: Label & Status Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Mosquito Breeding Risk
              </span>
              <div
                className={`p-2.5 rounded-2xl border transition-colors ${
                  isTriggered
                    ? 'bg-amber-950/90 border-amber-500/40 text-amber-300'
                    : isWaiting
                    ? 'bg-slate-900 border-slate-700 text-slate-400'
                    : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {isTriggered ? (
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                ) : isWaiting ? (
                  <Info className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Large Highly Visible Status Badge */}
            <div className="mt-5">
              {isTriggered ? (
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-sans tracking-wide text-amber-300">
                    RISK ALERT
                  </span>
                </div>
              ) : isWaiting ? (
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xl sm:text-2xl font-bold font-sans tracking-wide text-slate-200">
                    WAITING FOR VALID DATA
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-2xl sm:text-3xl font-black font-sans tracking-wide text-emerald-300">
                    NO RISK
                  </span>
                </div>
              )}
            </div>

            {/* Alert Message Banner */}
            <div
              className={`mt-5 p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed border transition-all ${
                isTriggered
                  ? 'bg-amber-950/60 border-amber-500/30 text-amber-100 font-medium'
                  : isWaiting
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-emerald-950/50 border-emerald-500/20 text-emerald-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isTriggered ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                <span>{risk.alertMessage}</span>
              </div>
            </div>

            {/* Short Explanation of the Rule */}
            <div className="mt-4 px-3 py-2 rounded-xl bg-black/40 border border-slate-800/80 text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Evaluation: </span>
              <span className={isTriggered ? 'text-amber-300 font-medium' : 'text-slate-300'}>
                {risk.ruleExplanation}
              </span>
            </div>
          </div>

          {/* Card Bottom: Timestamp & Disclaimer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Evaluated: {formatTimestamp(risk.evaluatedAt)}
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  isTriggered
                    ? 'bg-amber-500/20 text-amber-300'
                    : isWaiting
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {risk.level.replace('_', ' ')}
              </span>
            </div>

            {/* Mandatory Prototype Limitation Note */}
            <div className="text-[11px] text-slate-500 leading-snug border-l-2 border-emerald-500/30 pl-2">
              {risk.limitationNote}
            </div>

            {/* Hardware local control concise note */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-sans pt-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>LED and buzzer are controlled locally by the Arduino.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
