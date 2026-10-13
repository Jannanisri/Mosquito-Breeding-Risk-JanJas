import React, { useState } from 'react';
import {
  X,
  Cpu,
  Usb,
  Radio,
  Check,
  Copy,
  Terminal,
  AlertTriangle,
  FileCode,
  Layers,
} from 'lucide-react';
import type { ConnectionMode, ConnectionStatus } from '../types/sensor';
import { sensorService } from '../services/sensorService';


interface HardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ConnectionMode;
  status: ConnectionStatus;
  rawMessages: string[];
}

export const HardwareModal: React.FC<HardwareModalProps> = ({
  isOpen,
  onClose,
  mode,
  status,
  rawMessages,
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'arduino' | 'pinout' | 'bridge'>('connect');
  const [copiedCode, setCopiedCode] = useState(false);
  const [wsInputUrl, setWsInputUrl] = useState('ws://localhost:8080');
  const [serialError, setSerialError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const isWebSerial = sensorService.isWebSerialSupported();

  const handleConnectSerial = async () => {
    setSerialError(null);
    setIsConnecting(true);
    const res = await sensorService.connectSerial(9600);
    setIsConnecting(false);
    if (!res.success) {
      setSerialError(res.error || 'Failed to connect via USB Serial');
    }
  };

  const handleDisconnectSerial = async () => {
    await sensorService.disconnectSerial();
  };

  const handleConnectWebSocket = async () => {
    setSerialError(null);
    setIsConnecting(true);
    const res = await sensorService.connectWebSocket(wsInputUrl);
    setIsConnecting(false);
    if (!res.success) {
      setSerialError(res.error || 'Failed to connect to WebSocket Bridge');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const arduinoInoCode = `/*
 * MosqGuard — Arduino Uno R3 Sensor Node
 * Components:
 *  - Arduino Uno R3
 *  - DHT11 Temperature & Humidity Sensor on Pin D2
 *  - Warning LED on Pin D7 (via 220 ohm resistor)
 *  - Warning Buzzer on Pin D8
 *  
 * Local Control Rule:
 *  - If temperature >= 25.0 °C: Turn ON LED (D7) and Buzzer (D8)
 *  - If temperature < 25.0 °C: Turn OFF LED (D7) and Buzzer (D8)
 *
 * Serial Output:
 *  - Transmits JSON at 9600 baud for MosqGuard Dashboard
 */

#include <DHT.h>

#define DHTPIN 2         // DHT11 data pin connected to Digital Pin 2
#define DHTTYPE DHT11    // DHT11 sensor type
#define LED_PIN 7        // Red Warning LED connected to Digital Pin 7
#define BUZZER_PIN 8     // Warning Buzzer connected to Digital Pin 8

const float RISK_TEMP_THRESHOLD = 25.0; // Prototype risk threshold in °C

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initial state: OFF
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

void loop() {
  // Read sensor values (DHT11 sample rate is ~1-2 seconds)
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature(); // in Celsius

  // Check if any reads failed
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("{\\"error\\": \\"DHT11_READ_FAILED\\"}");
    delay(2000);
    return;
  }

  // Exact Prototype Local Control Logic:
  // If temperature >= 25.0 °C: Alert ON
  if (temperature >= RISK_TEMP_THRESHOLD) {
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
  }

  // Output formatted JSON line over USB Serial for MosqGuard
  Serial.print("{\\"temperature\\": ");
  Serial.print(temperature, 1);
  Serial.print(", \\"humidity\\": ");
  Serial.print(humidity, 0);
  Serial.println("}");

  delay(2000); // 2-second telemetry loop
}
`;

  const pythonBridgeCode = `# mosqguard_serial_bridge.py
# Simple Python bridge from Arduino USB Serial to WebSocket
import serial
import asyncio
import websockets
import json

SERIAL_PORT = "COM3"  # Adjust for your system: "COM3" (Windows) or "/dev/ttyUSB0"
BAUD_RATE = 9600

async def bridge_handler(websocket):
    print("MosqGuard Web Dashboard connected!")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        while True:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line:
                await websocket.send(line)
            await asyncio.sleep(0.1)
    except Exception as e:
        print("Bridge error:", e)

async def main():
    async with websockets.serve(bridge_handler, "localhost", 8080):
        print("MosqGuard WebSocket Bridge running on ws://localhost:8080")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#07110b] border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-950/80 bg-[#09150e]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950 border border-emerald-500/30 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Arduino Uno R3 Physical Integration</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  Hardware Service
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Connect your physical Arduino Uno R3 or review the wiring and sketch code.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-emerald-950/80 bg-[#050d08] px-6 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'connect'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-4 h-4" />
            <span>Live Data Connection</span>
          </button>

          <button
            onClick={() => setActiveTab('arduino')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'arduino'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Arduino Sketch (.ino)</span>
          </button>

          <button
            onClick={() => setActiveTab('pinout')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'pinout'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Circuit Pinout</span>
          </button>

          <button
            onClick={() => setActiveTab('bridge')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bridge'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Serial Bridge Option</span>
          </button>
        </div>

        {/* Modal Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">

          {/* TAB 1: CONNECT */}
          {activeTab === 'connect' && (
            <div className="space-y-6">
              {/* Important Transparency Notice as requested in Prompt */}
              <div className="p-4 rounded-2xl bg-[#0f1a13] border border-emerald-500/20 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Physical Architecture Note</span>
                </div>
                <p className="text-slate-300">
                  The Arduino Uno R3 does not feature onboard Wi-Fi. Live data is streamed either via{' '}
                  <strong className="text-white">direct USB Web Serial</strong> (1-click browser serial) or an{' '}
                  <strong className="text-white">intermediate communication bridge</strong> (Node/Python/WebSocket).
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  LED (Pin D7) and buzzer (Pin D8) are controlled locally by the Arduino based on the ≥25.0°C rule.
                </p>
              </div>

              {/* Method A: Web Serial API */}
              <div className="p-5 rounded-2xl bg-[#0a160f] border border-emerald-500/25 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Usb className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Direct USB Serial Connection (Recommended)</h4>
                      <p className="text-xs text-slate-400">
                        Connect directly to your Arduino Uno COM port in Chrome or Edge without installing any servers.
                      </p>
                    </div>
                  </div>
                  {isWebSerial ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      Web Serial Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                      Not Supported (Use Chrome/Edge)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {mode === 'serial' && status === 'connected' ? (
                    <button
                      onClick={handleDisconnectSerial}
                      className="px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/30 text-red-200 text-xs font-semibold transition-all"
                    >
                      Disconnect Arduino USB
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectSerial}
                      disabled={!isWebSerial || isConnecting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    >
                      {isConnecting ? 'Requesting Port...' : 'Connect Arduino Uno (USB Serial)'}
                    </button>
                  )}

                  <span className="text-xs text-slate-400 font-mono">Baud Rate: 9600</span>
                </div>

                {serialError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span>{serialError}</span>
                  </div>
                )}
              </div>

              {/* Method B: WebSocket Bridge */}
              <div className="p-5 rounded-2xl bg-[#0a160f] border border-emerald-950 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-5 h-5 text-teal-400" />
                  <div>
                    <h4 className="font-bold text-white text-sm">WebSocket Gateway / Local Bridge</h4>
                    <p className="text-xs text-slate-400">
                      Connect to an external Python, Node.js, or ESP8266/ESP32 serial gateway.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={wsInputUrl}
                    onChange={(e) => setWsInputUrl(e.target.value)}
                    placeholder="ws://localhost:8080"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-emerald-900 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                  />
                  {mode === 'websocket' && status === 'connected' ? (
                    <button
                      onClick={() => sensorService.disconnectWebSocket()}
                      className="px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/30 text-red-200 text-xs font-semibold"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectWebSocket}
                      className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                    >
                      Connect Bridge
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time Telemetry Terminal Preview */}
              <div className="p-4 rounded-2xl bg-black border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Raw Serial Stream Monitor</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {mode === 'demo' ? 'SIMULATOR ACTIVE' : `${status.toUpperCase()}`}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#050b07] border border-slate-900 font-mono text-xs text-emerald-400/90 h-28 overflow-y-auto space-y-1">
                  {rawMessages.length > 0 ? (
                    rawMessages.slice(-6).map((msg, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-slate-600">&gt;</span>
                        <span>{msg}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 italic">
                      {mode === 'demo'
                        ? '[Demo Mode active: Stream is generated from internal risk simulation engine]'
                        : '[Waiting for incoming serial packets from Arduino Uno R3...]'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARDUINO CODE */}
          {activeTab === 'arduino' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Arduino Uno R3 Firmware (.ino)</h4>
                  <p className="text-xs text-slate-400">
                    Flash this sketch directly to your Arduino Uno R3 via the official Arduino IDE.
                  </p>
                </div>
                <button
                  onClick={() => handleCopyCode(arduinoInoCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-black border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
                <pre>{arduinoInoCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: CIRCUIT PINOUT */}
          {activeTab === 'pinout' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">Component Pin Mapping &amp; Wiring Table</h4>
              <div className="rounded-2xl border border-emerald-950 overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0b1710] text-emerald-400 border-b border-emerald-900">
                    <tr>
                      <th className="p-3">Component</th>
                      <th className="p-3">Component Pin</th>
                      <th className="p-3">Arduino Uno R3 Pin</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950 bg-[#060e09] text-slate-300">
                    <tr>
                      <td className="p-3 font-bold text-white">DHT11 Sensor</td>
                      <td className="p-3">DATA (Out)</td>
                      <td className="p-3 text-emerald-300 font-bold">Digital Pin D2</td>
                      <td className="p-3 text-slate-400">With 10kΩ pull-up resistor to 5V</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">DHT11 Sensor</td>
                      <td className="p-3">VCC / GND</td>
                      <td className="p-3 text-emerald-300">5V &amp; GND</td>
                      <td className="p-3 text-slate-400">Power rails</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Warning LED</td>
                      <td className="p-3">Anode (+)</td>
                      <td className="p-3 text-amber-300 font-bold">Digital Pin D7</td>
                      <td className="p-3 text-slate-400">Through 220Ω current-limiting resistor</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Warning Buzzer</td>
                      <td className="p-3">Positive (+)</td>
                      <td className="p-3 text-amber-300 font-bold">Digital Pin D8</td>
                      <td className="p-3 text-slate-400">Active Piezo Buzzer</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Ground Return</td>
                      <td className="p-3">Cathodes (-)</td>
                      <td className="p-3 text-emerald-300">GND (Common)</td>
                      <td className="p-3 text-slate-400">Common ground with Uno</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b1610] border border-emerald-500/20 text-xs text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>LED and buzzer are controlled locally by the Arduino based on the ≥25.0°C rule.</span>
              </div>
            </div>
          )}

          {/* TAB 4: BRIDGE */}
          {activeTab === 'bridge' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Python Serial-to-WebSocket Bridge</h4>
                  <p className="text-xs text-slate-400">
                    Alternative lightweight script to bridge Arduino USB Serial to local WebSockets.
                  </p>
                </div>
                <button
                  onClick={() => handleCopyCode(pythonBridgeCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Bridge'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-black border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-96">
                <pre>{pythonBridgeCode}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-emerald-950/80 bg-[#09150e] flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            Status: <span className="text-emerald-400 font-bold uppercase">{status}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
