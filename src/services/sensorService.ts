import type { ConnectionMode, ConnectionStatus, SensorReading } from '../types/sensor';

export interface SensorServiceSubscriber {
  onReading: (reading: SensorReading, isDemo: boolean) => void;
  onStatusChange: (status: ConnectionStatus) => void;
  onModeChange: (mode: ConnectionMode) => void;
  onRawMessage?: (raw: string) => void;
}

class SensorDataService {
  private mode: ConnectionMode = 'demo';
  private status: ConnectionStatus = 'disconnected';
  private subscribers: Set<SensorServiceSubscriber> = new Set();
  private lastReading: SensorReading = {
    temperature: 26.8, // Initial demo sample triggering risk
    humidity: 68,
    timestamp: new Date(),
    isValid: true,
  };

  // Demo simulation state
  private demoInterval: number | null = null;
  private demoFluctuate: boolean = true;
  private currentDemoBaseTemp: number = 26.8;
  private currentDemoBaseHum: number = 68;

  // Stale data watchdog
  private staleTimer: number | null = null;
  private readonly STALE_TIMEOUT_MS = 10000;

  // Web Serial API handle
  private serialPort: any = null;
  private serialReader: any = null;
  private serialKeepReading: boolean = false;

  // WebSocket handle
  private ws: WebSocket | null = null;


  constructor() {
    // Start demo by default so the interface is immediately interactive
    this.startDemoMode();
  }

  // --- Subscription Management ---
  public subscribe(sub: SensorServiceSubscriber): () => void {
    this.subscribers.add(sub);
    // Immediately emit current state
    sub.onModeChange(this.mode);
    sub.onStatusChange(this.status);
    sub.onReading(this.lastReading, this.mode === 'demo');

    return () => {
      this.subscribers.delete(sub);
    };
  }

  private notifyReading(reading: SensorReading): void {
    this.lastReading = reading;
    this.resetStaleTimer();
    this.subscribers.forEach((sub) => sub.onReading(reading, this.mode === 'demo'));
  }

  private notifyStatus(status: ConnectionStatus): void {
    this.status = status;
    this.subscribers.forEach((sub) => sub.onStatusChange(status));
  }

  private notifyMode(mode: ConnectionMode): void {
    this.mode = mode;
    this.subscribers.forEach((sub) => sub.onModeChange(mode));
  }

  private notifyRaw(raw: string): void {
    this.subscribers.forEach((sub) => sub.onRawMessage?.(raw));
  }

  public getMode(): ConnectionMode {
    return this.mode;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getLastReading(): SensorReading {
    return this.lastReading;
  }

  // --- Stale Data Watchdog ---
  private resetStaleTimer(): void {
    if (this.staleTimer) {
      window.clearTimeout(this.staleTimer);
      this.staleTimer = null;
    }

    if (this.mode !== 'demo' && this.status === 'connected') {
      this.staleTimer = window.setTimeout(() => {
        if (this.status === 'connected') {
          this.notifyStatus('stale');
        }
      }, this.STALE_TIMEOUT_MS);
    }
  }

  // --- DEMO MODE IMPLEMENTATION ---
  public startDemoMode(): void {
    this.cleanupLiveConnections();
    this.mode = 'demo';
    this.notifyMode('demo');
    this.notifyStatus('connected');

    this.stopDemoInterval();

    // Emit initial demo sample
    this.applyDemoSample(this.currentDemoBaseTemp, this.currentDemoBaseHum, true);

    // Gentle natural ambient fluctuation every 3.5 seconds
    this.demoInterval = window.setInterval(() => {
      if (!this.demoFluctuate) return;
      if (this.lastReading.temperature === null) return;

      // Small natural drift around base
      const tempDrift = (Math.random() - 0.5) * 0.4;
      const humDrift = (Math.random() - 0.5) * 1.5;

      const newTemp = Math.round((this.currentDemoBaseTemp + tempDrift) * 10) / 10;
      const newHum = Math.round(
        Math.max(20, Math.min(95, this.currentDemoBaseHum + humDrift))
      );

      this.notifyReading({
        temperature: newTemp,
        humidity: newHum,
        timestamp: new Date(),
        isValid: true,
      });
    }, 3500);
  }

  public setDemoFluctuation(enabled: boolean): void {
    this.demoFluctuate = enabled;
  }

  public getDemoFluctuation(): boolean {
    return this.demoFluctuate;
  }

  public applyDemoSample(
    temp: number | null,
    hum: number | null,
    isValid: boolean = true
  ): void {
    if (this.mode !== 'demo') {
      this.startDemoMode();
    }

    if (temp !== null) this.currentDemoBaseTemp = temp;
    if (hum !== null) this.currentDemoBaseHum = hum;

    const reading: SensorReading = {
      temperature: isValid ? temp : null,
      humidity: isValid ? hum : null,
      timestamp: new Date(),
      isValid: isValid && temp !== null,
    };

    this.notifyReading(reading);
  }

  private stopDemoInterval(): void {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  // --- LIVE WEB SERIAL API (Physical Arduino Uno R3 direct USB connection) ---
  public isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public async connectSerial(baudRate: number = 9600): Promise<{ success: boolean; error?: string }> {
    if (!this.isWebSerialSupported()) {
      return {
        success: false,
        error: 'Web Serial API is not supported in this browser. Please use Chrome, Edge, or an active WebSocket Bridge.',
      };
    }

    this.cleanupLiveConnections();
    this.stopDemoInterval();
    this.mode = 'serial';
    this.notifyMode('serial');
    this.notifyStatus('connecting');

    try {
      const serial = (navigator as any).serial;
      this.serialPort = await serial.requestPort();
      await this.serialPort.open({ baudRate });

      this.notifyStatus('waiting_for_data');
      this.serialKeepReading = true;

      // Reset reading to null until physical packet arrives
      this.notifyReading({
        temperature: null,
        humidity: null,
        timestamp: null,
        isValid: false,
      });

      this.readSerialStream();
      return { success: true };
    } catch (err: any) {
      this.serialPort = null;
      this.notifyStatus('disconnected');
      return {
        success: false,
        error: err?.message || 'Failed to connect to USB serial device.',
      };
    }
  }

  private async readSerialStream(): Promise<void> {
    if (!this.serialPort || !this.serialPort.readable) return;

    try {
      const textDecoder = new TextDecoderStream();
      this.serialPort.readable.pipeTo(textDecoder.writable);
      this.serialReader = textDecoder.readable.getReader();

      let buffer = '';

      while (this.serialKeepReading) {
        const { value, done } = await this.serialReader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || ''; // Keep remainder

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              this.notifyRaw(trimmed);
              this.parseSensorData(trimmed);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Serial reader interrupted:', err);
    } finally {
      if (this.mode === 'serial') {
        this.notifyStatus('disconnected');
      }
    }
  }

  public async disconnectSerial(): Promise<void> {
    this.serialKeepReading = false;
    try {
      if (this.serialReader) {
        await this.serialReader.cancel();
        this.serialReader = null;
      }
      if (this.serialPort) {
        await this.serialPort.close();
        this.serialPort = null;
      }
    } catch (err) {
      console.warn('Error closing serial port:', err);
    }
    this.notifyStatus('disconnected');
  }

  // --- LIVE WEBSOCKET BRIDGE ---
  public connectWebSocket(url: string = 'ws://localhost:8080'): Promise<{ success: boolean; error?: string }> {
    this.cleanupLiveConnections();
    this.stopDemoInterval();
    this.mode = 'websocket';
    this.notifyMode('websocket');
    this.notifyStatus('connecting');


    // Reset readings
    this.notifyReading({
      temperature: null,
      humidity: null,
      timestamp: null,
      isValid: false,
    });

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.notifyStatus('waiting_for_data');
          resolve({ success: true });
        };

        this.ws.onmessage = (event) => {
          const raw = String(event.data).trim();
          this.notifyRaw(raw);
          this.parseSensorData(raw);
        };

        this.ws.onerror = () => {
          this.notifyStatus('disconnected');
          resolve({ success: false, error: 'Could not connect to WebSocket bridge at ' + url });
        };

        this.ws.onclose = () => {
          if (this.mode === 'websocket') {
            this.notifyStatus('disconnected');
          }
        };
      } catch (err: any) {
        this.notifyStatus('disconnected');
        resolve({ success: false, error: err?.message || 'WebSocket error' });
      }
    });
  }

  public disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.notifyStatus('disconnected');
  }

  // --- DATA PARSER ---
  // Flexible parser supporting JSON, CSV (temp,hum), or formatted strings from Arduino Uno
  private parseSensorData(raw: string): void {
    let temp: number | null = null;
    let hum: number | null = null;

    try {
      // 1. Attempt JSON: {"temperature": 26.5, "humidity": 65} or {"temp": 26.5, "hum": 65}
      if (raw.startsWith('{') && raw.endsWith('}')) {
        const parsed = JSON.parse(raw);
        if ('temperature' in parsed) temp = parseFloat(parsed.temperature);
        else if ('temp' in parsed) temp = parseFloat(parsed.temp);

        if ('humidity' in parsed) hum = parseFloat(parsed.humidity);
        else if ('hum' in parsed) hum = parseFloat(parsed.hum);
      }
    } catch {
      // Not JSON, continue to other formats
    }

    // 2. Attempt CSV: "26.5,65" or "26.5;65"
    if (temp === null) {
      const parts = raw.split(/[,;\t]/).map((s) => s.trim());
      if (parts.length >= 2) {
        const parsedT = parseFloat(parts[0]);
        const parsedH = parseFloat(parts[1]);
        if (!isNaN(parsedT)) temp = parsedT;
        if (!isNaN(parsedH)) hum = parsedH;
      }
    }

    // 3. Attempt Regex: "TEMP: 26.5 HUM: 65" or "T=26.5 H=65"
    if (temp === null) {
      const tempMatch = raw.match(/(?:TEMP|T|Temperature)[:=\s]+([0-9.]+)/i);
      const humMatch = raw.match(/(?:HUM|H|Humidity)[:=\s]+([0-9.]+)/i);
      if (tempMatch) temp = parseFloat(tempMatch[1]);
      if (humMatch) hum = parseFloat(humMatch[1]);
    }

    const isValid = temp !== null && !isNaN(temp) && isFinite(temp);

    if (isValid) {
      this.notifyStatus('connected');
      this.notifyReading({
        temperature: temp,
        humidity: hum !== null && !isNaN(hum) ? hum : null,
        timestamp: new Date(),
        isValid: true,
        rawString: raw,
      });
    } else {
      // Malformed or sensor error reading (e.g. DHT11 read failure / checksum error)
      this.notifyReading({
        temperature: null,
        humidity: null,
        timestamp: new Date(),
        isValid: false,
        rawString: raw,
      });
    }
  }

  // --- CLEANUP ---
  public cleanupLiveConnections(): void {
    if (this.staleTimer) {
      clearTimeout(this.staleTimer);
      this.staleTimer = null;
    }
    this.disconnectSerial();
    this.disconnectWebSocket();
  }
}

export const sensorService = new SensorDataService();
