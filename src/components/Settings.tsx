import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Save, Bell, BellRing, Volume2, CheckCircle2, AlertCircle } from 'lucide-react';
import { requestNotificationPermission, sendBrowserNotification, playNotificationSound } from '../utils';

export const Settings: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  
  const [target, setTarget] = useState(settings.defaultTarget);
  const [startTime, setStartTime] = useState(settings.startTime);
  const [endTime, setEndTime] = useState(settings.endTime);
  const [cons, setCons] = useState(settings.defaultConsumption);
  const [price, setPrice] = useState(settings.defaultFuelPrice);
  const [enableNotif, setEnableNotif] = useState(settings.enableNotifications !== false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [testSent, setTestSent] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      defaultTarget: target,
      startTime,
      endTime,
      defaultConsumption: cons,
      defaultFuelPrice: price,
      enableNotifications: enableNotif
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleRequestPerm = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification('🔔 Đã bật thông báo!', 'Ứng dụng sẽ nhắc bạn nhập doanh thu khi hết giờ làm việc.');
    }
  };

  const handleTestNotification = () => {
    playNotificationSound();
    if (notifPermission === 'granted') {
      sendBrowserNotification('🚖 Grab Tracker: Hết giờ ca chạy!', 'Đây là thông báo thử nghiệm nhắc nhở nhập doanh thu & số km.');
    }
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="pb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Cài đặt mặc định</h2>
      <p className="text-sm text-gray-500 mb-6">
        Các cài đặt này sẽ được dùng làm giá trị mặc định cho mỗi ngày mới.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Notification Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3 border-b pb-2">
            <BellRing size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-gray-700">Thông báo & Nhắc nhở</h3>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-800">Nhắc nhở kết thúc ca chạy</p>
              <p className="text-xs text-gray-500">Hiển thị banner & đẩy thông báo khi đến {endTime}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enableNotif} 
                onChange={e => setEnableNotif(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Quyền thông báo trình duyệt:</span>
              <span className={`font-semibold flex items-center gap-1 ${
                notifPermission === 'granted' ? 'text-green-600' : notifPermission === 'denied' ? 'text-red-500' : 'text-orange-500'
              }`}>
                {notifPermission === 'granted' && <CheckCircle2 size={13} />}
                {notifPermission === 'denied' && <AlertCircle size={13} />}
                {notifPermission === 'granted' ? 'Đã cho phép' : notifPermission === 'denied' ? 'Bị chặn trong trình duyệt' : 'Chưa cấp quyền'}
              </span>
            </div>

            <div className="flex gap-2 mt-1">
              {notifPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPerm}
                  className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Bell size={14} />
                  <span>Cấp quyền thông báo</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleTestNotification}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Volume2 size={14} />
                <span>{testSent ? 'Đã phát chuông!' : 'Thử chuông & thông báo'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mục tiêu (Target) mặc định / ngày</label>
          <input 
            type="number" min="0" step="1000" required
            className="w-full p-3 border border-gray-300 rounded-lg text-lg font-bold"
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
            <input 
              type="time" required
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
            <input 
              type="time" required
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Thông số xăng xe</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mức tiêu hao (L/100km)</label>
              <input 
                type="number" min="0" step="0.1" required
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={cons}
                onChange={e => setCons(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá xăng mặc định (VNĐ/L)</label>
              <input 
                type="number" min="0" step="100" required
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Save size={20} />
          LƯU CÀI ĐẶT
        </button>

        {savedMsg && (
          <p className="text-center text-green-600 font-medium mt-2">Đã lưu thành công!</p>
        )}
      </form>
    </div>
  );
};
