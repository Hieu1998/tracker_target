import { DailyRecord } from './types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateVN = (dateString: string) => {
  const date = new Date(dateString);
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${dayName} - ${day}/${month}/${year}`;
};

export const calculateStats = (record: DailyRecord) => {
  const fuelUsed = (record.distance * record.fuelConsumption) / 100;
  const fuelCost = fuelUsed * record.fuelPrice;
  const netIncome = record.revenue - fuelCost;
  const difference = netIncome - record.target;
  const percentage = record.target > 0 ? (netIncome / record.target) * 100 : 0;

  return {
    fuelUsed,
    fuelCost,
    netIncome,
    difference,
    percentage
  };
};

const MOTIVATION_QUOTES = [
  "Mỗi ngày kiếm thêm một chút, cuối tháng sẽ thành rất nhiều.",
  "300k hôm nay, 9 triệu sau 30 ngày.",
  "Đừng quan tâm hôm qua, tập trung kiếm tiền hôm nay.",
  "Chạy thêm một cuốc nữa.",
  "Mục tiêu chưa đạt thì chưa dừng.",
  "Bền bỉ mỗi ngày, thành quả sẽ tới."
];

export const getRandomQuote = () => MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];

export const isShiftEnded = (startTimeStr: string, endTimeStr: string): boolean => {
  if (!endTimeStr) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [endH, endM] = endTimeStr.split(':').map(Number);
  const endMinutes = endH * 60 + endM;

  const [startH, startM] = (startTimeStr || '19:00').split(':').map(Number);
  const startMinutes = startH * 60 + startM;

  // Case 1: Same day shift (e.g., 19:00 -> 23:00)
  if (startMinutes <= endMinutes) {
    return currentMinutes >= endMinutes;
  }

  // Case 2: Overnight shift (e.g., 20:00 -> 02:00 next day)
  // Shift has ended if current time is after endMinutes (e.g. 03:00) AND before startMinutes (e.g. 18:00)
  return currentMinutes >= endMinutes && currentMinutes < startMinutes;
};

export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a friendly two-tone chime
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.12); // A5
    
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.5);
  } catch {
    // Audio might be restricted until user interacts, safely ignore
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
};

export const sendBrowserNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    playNotificationSound();
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'grab-target-reminder',
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
};
