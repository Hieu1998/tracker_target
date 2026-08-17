export interface AppSettings {
  defaultTarget: number;
  startTime: string; // '19:00'
  endTime: string; // '23:00'
  defaultConsumption: number; // L/100km
  defaultFuelPrice: number; // VND/L
  enableNotifications?: boolean;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  target: number;
  revenue: number;
  distance: number;
  fuelConsumption: number;
  fuelPrice: number;
  startTime: number | null; // timestamp
  endTime: number | null; // timestamp
  status: 'idle' | 'running' | 'completed';
}
