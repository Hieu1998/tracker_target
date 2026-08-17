import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, DailyRecord } from './types';
import { getTodayDateString } from './utils';

const defaultSettings: AppSettings = {
  defaultTarget: 300000,
  startTime: '19:00',
  endTime: '23:00',
  defaultConsumption: 10,
  defaultFuelPrice: 20000,
  enableNotifications: true,
};

interface AppContextType {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  records: Record<string, DailyRecord>;
  getTodayRecord: () => DailyRecord;
  updateRecord: (record: DailyRecord) => void;
  deleteRecord: (date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('grab_settings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [records, setRecordsState] = useState<Record<string, DailyRecord>>(() => {
    try {
      const saved = localStorage.getItem('grab_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const setSettings = (newSettings: AppSettings) => {
    setSettingsState(newSettings);
    localStorage.setItem('grab_settings', JSON.stringify(newSettings));
  };

  const updateRecord = (record: DailyRecord) => {
    setRecordsState(prev => {
      const updated = { ...prev, [record.date]: record };
      localStorage.setItem('grab_records', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteRecord = (date: string) => {
    setRecordsState(prev => {
      const updated = { ...prev };
      delete updated[date];
      localStorage.setItem('grab_records', JSON.stringify(updated));
      return updated;
    });
  };

  const getTodayRecord = (): DailyRecord => {
    const today = getTodayDateString();
    if (records[today]) {
      return records[today];
    }
    return {
      date: today,
      target: settings.defaultTarget,
      revenue: 0,
      distance: 0,
      fuelConsumption: settings.defaultConsumption,
      fuelPrice: settings.defaultFuelPrice,
      startTime: null,
      endTime: null,
      status: 'idle',
    };
  };

  return (
    <AppContext.Provider value={{ settings, setSettings, records, getTodayRecord, updateRecord, deleteRecord }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
