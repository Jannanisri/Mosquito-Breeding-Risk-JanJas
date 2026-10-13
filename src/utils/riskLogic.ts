import type { RiskAssessment } from '../types/sensor';

export const RISK_TRIGGER_THRESHOLD = 25.0; // °C

export const ALERT_TRIGGER_MESSAGE =
  'Temperature-based mosquito-breeding risk detected. Check the area for stagnant water and take appropriate preventive action.';

export const NO_RISK_MESSAGE =
  'No temperature-based risk detected by the current prototype rule.';

export const WAITING_DATA_MESSAGE =
  'Waiting for valid temperature reading from sensor. Risk assessment cannot be calculated without verified data.';

export const PROTOTYPE_LIMITATION_NOTE =
  'Important: This is a simplified temperature-based demonstration rule, not proof that water contains mosquito eggs or larvae. Temperature alone does not confirm mosquito breeding.';

/**
 * Evaluates the mosquito breeding risk according to the exact prototype specification:
 * - temp >= 25.0 °C -> RISK ALERT
 * - temp < 25.0 °C  -> NO RISK
 * - temp === 25.0 °C -> RISK ALERT
 * - invalid / null / undefined / NaN -> WAITING FOR VALID DATA (never NO RISK!)
 */
export function evaluateRisk(
  temperature: number | null | undefined,
  timestamp: Date | null = new Date()
): RiskAssessment {
  if (
    temperature === null ||
    temperature === undefined ||
    typeof temperature !== 'number' ||
    Number.isNaN(temperature) ||
    !Number.isFinite(temperature)
  ) {
    return {
      level: 'WAITING_FOR_DATA',
      title: 'WAITING FOR VALID DATA',
      isTriggered: false,
      alertMessage: WAITING_DATA_MESSAGE,
      ruleExplanation: 'Awaiting sensor stream from Arduino Uno R3...',
      limitationNote: PROTOTYPE_LIMITATION_NOTE,
      evaluatedAt: timestamp,
      temperatureValue: null,
    };
  }

  // Exact prototype threshold check: >= 25.0°C
  const isTriggered = temperature >= RISK_TRIGGER_THRESHOLD;

  if (isTriggered) {
    return {
      level: 'RISK_ALERT',
      title: 'RISK ALERT',
      isTriggered: true,
      alertMessage: ALERT_TRIGGER_MESSAGE,
      ruleExplanation: `Trigger Rule: Temperature (${temperature.toFixed(1)}°C) ≥ ${RISK_TRIGGER_THRESHOLD.toFixed(1)}°C threshold`,
      limitationNote: PROTOTYPE_LIMITATION_NOTE,
      evaluatedAt: timestamp,
      temperatureValue: temperature,
    };
  }

  return {
    level: 'NO_RISK',
    title: 'NO RISK',
    isTriggered: false,
    alertMessage: NO_RISK_MESSAGE,
    ruleExplanation: `Current Rule: Temperature (${temperature.toFixed(1)}°C) < ${RISK_TRIGGER_THRESHOLD.toFixed(1)}°C threshold`,
    limitationNote: PROTOTYPE_LIMITATION_NOTE,
    evaluatedAt: timestamp,
    temperatureValue: temperature,
  };
}

export function formatTemperature(temp: number | null | undefined): string {
  if (temp === null || temp === undefined || Number.isNaN(temp)) return '--.-';
  return temp.toFixed(1);
}

export function formatHumidity(hum: number | null | undefined): string {
  if (hum === null || hum === undefined || Number.isNaN(hum)) return '--';
  return Math.round(hum).toString();
}

export function formatTimestamp(date: Date | null | undefined): string {
  if (!date) return 'No data yet';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
