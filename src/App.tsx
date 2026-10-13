import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MonitoringCards } from './components/MonitoringCards';
import { DemoControlsBar } from './components/DemoControlsBar';
import { HardwareModal } from './components/HardwareModal';
import { Footer } from './components/Footer';
import { MosquitoCursor } from './components/MosquitoCursor';
import { sensorService } from './services/sensorService';
import { soundAlert } from './utils/soundAlert';
import { evaluateRisk } from './utils/riskLogic';
import type { ConnectionMode, ConnectionStatus, SensorReading } from './types/sensor';


export const App: React.FC = () => {
  // Service states
  const [mode, setMode] = useState<ConnectionMode>(sensorService.getMode());
  const [status, setStatus] = useState<ConnectionStatus>(sensorService.getStatus());
  const [reading, setReading] = useState<SensorReading>(sensorService.getLastReading());
  const [isDemo, setIsDemo] = useState<boolean>(sensorService.getMode() === 'demo');
  const [rawMessages, setRawMessages] = useState<string[]>([]);

  // Sound alert state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundAlert.isEnabled());

  // Hardware modal state
  const [hardwareModalOpen, setHardwareModalOpen] = useState<boolean>(false);

  // Auto-fluctuate state for demo mode
  const [autoFluctuate, setAutoFluctuate] = useState<boolean>(sensorService.getDemoFluctuation());

  // Previous risk state to detect transition into RISK_ALERT for sound
  const prevRiskRef = useRef<string>('NO_RISK');

  // Compute risk assessment directly using exact prototype logic
  const risk = evaluateRisk(reading.temperature, reading.timestamp);

  // Subscribe to sensor service updates
  useEffect(() => {
    const unsubscribe = sensorService.subscribe({
      onReading: (newReading, demoFlag) => {
        setReading(newReading);
        setIsDemo(demoFlag);
      },
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onModeChange: (newMode) => {
        setMode(newMode);
        setIsDemo(newMode === 'demo');
      },
      onRawMessage: (raw) => {
        setRawMessages((prev) => [...prev.slice(-30), raw]);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Trigger audio alert only when transitioning into RISK_ALERT and sound is enabled
  useEffect(() => {
    if (risk.isTriggered && prevRiskRef.current !== 'RISK_ALERT') {
      soundAlert.playRiskAlert();
    }
    prevRiskRef.current = risk.level;
  }, [risk.level, risk.isTriggered]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundAlert.setEnabled(next);
  };

  const handleToggleMode = (newMode: ConnectionMode) => {
    if (newMode === 'demo') {
      sensorService.startDemoMode();
    } else {
      setHardwareModalOpen(true);
    }
  };

  const handleApplyDemoSample = (temp: number | null, hum: number | null, isValid = true) => {
    sensorService.applyDemoSample(temp, hum, isValid);
  };

  const handleToggleFluctuate = (enabled: boolean) => {
    setAutoFluctuate(enabled);
    sensorService.setDemoFluctuation(enabled);
  };

  const scrollToMonitoringCards = () => {
    const el = document.getElementById('monitoring-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050b07] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/25 selection:text-emerald-200">
      {/* Custom Vector Mosquito Cursor */}
      <MosquitoCursor />

      {/* Top Navigation */}
      <Navbar
        mode={mode}
        status={status}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHardwareModal={() => setHardwareModalOpen(true)}
        onToggleMode={handleToggleMode}
        isRiskTriggered={risk.isTriggered}
        hasRealData={mode !== 'demo' && status === 'connected'}
      />

      {/* Main Single-Page Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          mode={mode}
          status={status}
          isRiskTriggered={risk.isTriggered}
          onScrollToCards={scrollToMonitoringCards}
          onOpenHardwareModal={() => setHardwareModalOpen(true)}
        />

        {/* Core Monitoring Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          
          {/* Exactly Three Main Monitoring Cards */}
          <MonitoringCards
            reading={reading}
            risk={risk}
            isDemo={isDemo}
          />

          {/* Interactive Demo Controls Bar (Visible during Demo mode) */}
          {isDemo && (
            <DemoControlsBar
              currentTemp={reading.temperature}
              currentHum={reading.humidity}
              isAutoFluctuate={autoFluctuate}
              onApplySample={handleApplyDemoSample}
              onToggleFluctuate={handleToggleFluctuate}
            />
          )}

          {/* If in live hardware mode and disconnected or waiting for data, show prominent hardware connector */}
          {!isDemo && status !== 'connected' && (
            <div className="p-6 rounded-3xl bg-[#0a150f] border border-emerald-500/30 text-center space-y-3">
              <h3 className="text-base font-bold text-white">
                Physical Arduino Uno R3 Disconnected
              </h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Connect your Arduino Uno via direct USB Serial in Chrome/Edge, or switch back to Demo Mode to view simulated readings.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setHardwareModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Connect Arduino USB Port
                </button>
                <button
                  onClick={() => sensorService.startDemoMode()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Switch to Demo Mode
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Arduino Hardware Integration Modal */}
      <HardwareModal
        isOpen={hardwareModalOpen}
        onClose={() => setHardwareModalOpen(false)}
        mode={mode}
        status={status}
        rawMessages={rawMessages}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
