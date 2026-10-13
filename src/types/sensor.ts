export type RiskLevel = 'RISK_ALERT' | 'NO_RISK' | 'WAITING_FOR_DATA';

export type ConnectionMode = 'demo' | 'serial' | 'websocket';

export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'waiting_for_data'
  | 'stale';

export interface SensorReading {
  temperature: number | null;
  humidity: number | null;
  timestamp: Date | null;
  isValid: boolean;
  rawString?: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  title: string;
  isTriggered: boolean;
  alertMessage: string;
  ruleExplanation: string;
  limitationNote: string;
  evaluatedAt: Date | null;
  temperatureValue: number | null;
}

export interface HardwareInfo {
  microcontroller: 'Arduino Uno R3';
  sensor: 'DHT11 (Digital Sensor)';
  ledPin: 'Digital Pin D7 (Warning LED)';
  buzzerPin: 'Digital Pin D8 (Piezo Buzzer)';
  thresholdTemp: 25.0;
  localControlNote: string;
}
