import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { 
  formatCurrency, 
  formatDateVN, 
  calculateStats, 
  getRandomQuote, 
  getTodayDateString,
  isShiftEnded,
  sendBrowserNotification,
  requestNotificationPermission
} from '../utils';
import { 
  Target, 
  Play, 
  Square, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Edit3, 
  BellRing, 
  Bell, 
  X, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { DailyRecord } from '../types';

export const Home: React.FC = () => {
  const { getTodayRecord, updateRecord, settings } = useAppContext();
  const [quote, setQuote] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  
  // Local form state
  const [formRev, setFormRev] = useState(0);
  const [formDist, setFormDist] = useState(0);
  const [formCons, setFormCons] = useState(10);
  const [formPrice, setFormPrice] = useState(20000);
  const [formTarget, setFormTarget] = useState(300000);
  const [isEnding, setIsEnding] = useState(false);
  const [showEditTarget, setShowEditTarget] = useState(false);

  const record = getTodayRecord();
  const stats = calculateStats(record);

  const isEnded = isShiftEnded(settings.startTime, settings.endTime);
  const shouldShowReminder = isEnded && record.status !== 'completed' && !dismissBanner;

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  // Update clock and check shift timer every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Trigger push notification when shift ends
  useEffect(() => {
    if (settings.enableNotifications === false) return;
    if (notifPermission !== 'granted') return;
    if (record.status === 'completed') return;

    if (isEnded) {
      const notifKey = `grab_notif_sent_${record.date}`;
      const alreadySent = localStorage.getItem(notifKey);
      if (!alreadySent) {
        sendBrowserNotification(
          '🚖 Grab Tracker: Hết ca chạy hôm nay!',
          `Đã đến ${settings.endTime}! Đừng quên nhập doanh thu và số km để xem lợi nhuận thực tế nhé.`
        );
        localStorage.setItem(notifKey, 'true');
      }
    }
  }, [isEnded, record.status, record.date, settings.enableNotifications, settings.endTime, notifPermission]);

  const handleEnableNotification = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification('🔔 Đã bật thông báo thành công!', 'Ứng dụng sẽ nhắc nhở bạn khi đến giờ kết thúc ca chạy.');
    }
  };

  const handleStart = () => {
    updateRecord({
      ...record,
      startTime: Date.now(),
      status: 'running'
    });
  };

  const openForm = (endDay = false) => {
    setFormRev(record.revenue);
    setFormDist(record.distance);
    setFormCons(record.fuelConsumption);
    setFormPrice(record.fuelPrice);
    setIsEnding(endDay);
    setShowForm(true);
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    updateRecord({
      ...record,
      revenue: formRev,
      distance: formDist,
      fuelConsumption: formCons,
      fuelPrice: formPrice,
      endTime: isEnding ? Date.now() : record.endTime,
      status: isEnding ? 'completed' : record.status
    });
    setShowForm(false);
  };

  const handleTargetUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateRecord({
      ...record,
      target: formTarget
    });
    setShowEditTarget(false);
  };

  const openTargetEdit = () => {
    setFormTarget(record.target);
    setShowEditTarget(true);
  };

  const progress = Math.min(stats.percentage, 100);
  const isReached = stats.difference >= 0;

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Shift End Reminder Banner */}
      {shouldShowReminder && (
        <div className="bg-linear-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg border border-orange-400/40 relative overflow-hidden animate-pulse">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-xl mt-0.5">
                <BellRing size={22} className="text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-base">
                  <span>Hết giờ chạy dự kiến ({settings.endTime})!</span>
                </div>
                <p className="text-xs text-orange-100 mt-1 leading-relaxed">
                  Đã đến giờ nghỉ ngơi. Hãy cập nhật doanh thu và số km hôm nay để chốt số nhé!
                </p>
              </div>
            </div>
            <button 
              onClick={() => setDismissBanner(true)}
              className="text-white/80 hover:text-white p-1"
              title="Ẩn thông báo"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex gap-2">
            <button
              onClick={() => openForm(true)}
              className="flex-1 bg-white text-orange-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            >
              <span>Tổng kết ngày ngay</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => openForm(false)}
              className="bg-black/20 hover:bg-black/30 text-white font-medium py-2 px-3 rounded-xl text-xs active:scale-95 transition-transform"
            >
              Nhập nhanh
            </button>
          </div>
        </div>
      )}

      {/* Permission banner prompt if not yet granted */}
      {notifPermission === 'default' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-blue-600 shrink-0" />
            <span>Bật thông báo để nhắc nhở khi hết ca ({settings.endTime})</span>
          </div>
          <button 
            onClick={handleEnableNotification}
            className="bg-blue-600 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 shadow-xs hover:bg-blue-700 active:scale-95"
          >
            Bật
          </button>
        </div>
      )}

      <div className="text-center py-1">
        <h2 className="text-gray-500 font-semibold uppercase tracking-wide text-xs">{formatDateVN(record.date)}</h2>
        <p className="text-sm text-gray-400 mt-1 italic">"{quote}"</p>
      </div>

      {/* Target and Realized Income Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <Target size={16} className="text-blue-600" />
            <p className="text-gray-500 font-medium text-xs tracking-wider">MỤC TIÊU HÔM NAY</p>
          </div>
          <button onClick={openTargetEdit} className="text-blue-500 p-1 hover:bg-blue-50 rounded-md">
            <Edit3 size={16} />
          </button>
        </div>
        <p className="text-3xl font-extrabold text-gray-800">{formatCurrency(record.target)}</p>

        <div className="mt-6 flex justify-between items-end">
          <div>
            <p className="text-gray-500 font-medium text-xs mb-1">THỰC TẾ (ĐÃ TRỪ XĂNG)</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.netIncome)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 font-medium text-xs mb-1">{isReached ? 'VƯỢT' : 'CÒN THIẾU'}</p>
            <p className={`text-xl font-bold ${isReached ? 'text-green-500' : 'text-orange-500'}`}>
              {isReached ? '+' : ''}{formatCurrency(Math.abs(stats.difference))}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-gray-500">TIẾN ĐỘ</span>
            <span className={isReached ? 'text-green-600' : 'text-blue-600 font-bold'}>{stats.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isReached ? 'bg-green-500' : 'bg-blue-600'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {record.status !== 'idle' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">DOANH THU</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(record.revenue)}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{record.distance} km</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">TIỀN XĂNG</p>
            <p className="text-lg font-bold text-red-500">-{formatCurrency(stats.fuelCost)}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{stats.fuelUsed.toFixed(1)} L ({record.fuelConsumption}L/100km)</p>
          </div>
        </div>
      )}

      {record.status === 'idle' && (
        <div className="mt-4 flex flex-col gap-3">
          <button 
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            <Play size={20} className="fill-white" />
            BẮT ĐẦU CHẠY
          </button>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Clock size={14} />
            <span>Ca chạy: {settings.startTime} - {settings.endTime}</span>
          </div>
        </div>
      )}

      {record.status === 'running' && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="bg-blue-50 text-blue-700 p-3 rounded-xl flex items-center justify-between text-xs font-medium border border-blue-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
              Đang trong ca chạy
            </span>
            <span>Dự kiến hết ca: <b>{settings.endTime}</b></span>
          </div>
          <button 
            onClick={() => openForm(false)}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xs"
          >
            <TrendingUp size={20} />
            CẬP NHẬT DOANH THU
          </button>
          <button 
            onClick={() => openForm(true)}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            <Square size={20} />
            KẾT THÚC NGÀY
          </button>
        </div>
      )}

      {record.status === 'completed' && (
        <div className="mt-4">
          <div className={`p-4 rounded-xl flex items-start gap-3 ${isReached ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
            {isReached ? <CheckCircle className="text-green-500 mt-1 shrink-0" /> : <AlertTriangle className="text-orange-500 mt-1 shrink-0" />}
            <div>
              <h3 className={`font-bold ${isReached ? 'text-green-700' : 'text-orange-700'}`}>
                {isReached ? '🎉 ĐÃ ĐẠT TARGET' : '🔥 CỐ THÊM MỘT CHÚT VÀO NGÀY MAI'}
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${isReached ? 'text-green-600' : 'text-orange-600'}`}>
                {isReached 
                  ? `Tuyệt vời! Thu nhập thực tế hôm nay đạt ${formatCurrency(stats.netIncome)}, vượt ${formatCurrency(stats.difference)}.`
                  : `Hôm nay thu nhập thực tế đạt ${formatCurrency(stats.netIncome)}, còn thiếu ${formatCurrency(Math.abs(stats.difference))}. Ngày mai bù lại nhé!`
                }
              </p>
            </div>
          </div>
          <button 
            onClick={() => openForm(false)}
            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            <Edit3 size={16} /> Sửa kết quả hôm nay
          </button>
        </div>
      )}

      {/* Target Edit Modal */}
      {showEditTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Sửa mục tiêu hôm nay</h3>
            <form onSubmit={handleTargetUpdate}>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1 font-medium">Mục tiêu (VNĐ)</label>
                <input 
                  type="number" min="0" step="1000" required
                  className="w-full p-3 border border-gray-300 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formTarget || ''}
                  onChange={e => setFormTarget(Number(e.target.value))}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEditTarget(false)} className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-xl font-medium">Hủy</button>
                <button type="submit" className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-medium">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Data Input Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 my-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">
              {isEnding ? 'Tổng kết ngày' : 'Cập nhật số liệu'}
            </h3>
            <form onSubmit={submitForm}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng doanh thu (VNĐ)</label>
                  <input 
                    type="number" min="0" required
                    className="w-full p-3 border border-gray-300 rounded-xl font-bold text-lg text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formRev || ''}
                    onChange={e => setFormRev(Number(e.target.value))}
                    placeholder="VD: 450000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng quãng đường (km)</label>
                  <input 
                    type="number" min="0" step="0.1" required
                    className="w-full p-3 border border-gray-300 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formDist || ''}
                    onChange={e => setFormDist(Number(e.target.value))}
                    placeholder="VD: 50"
                  />
                </div>
                
                <div className="pt-2 border-t flex flex-col gap-3">
                  <p className="text-xs text-gray-500 uppercase font-bold">Thông số xăng (có thể sửa)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tiêu hao (L/100km)</label>
                      <input 
                        type="number" min="0" step="0.1" required
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        value={formCons}
                        onChange={e => setFormCons(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Giá xăng (VNĐ/L)</label>
                      <input 
                        type="number" min="0" required
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                        value={formPrice}
                        onChange={e => setFormPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview of calculation */}
                {(formRev > 0 || formDist > 0) && (
                  <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2 mt-4 border border-gray-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Lượng xăng tiêu thụ:</span>
                      <span className="font-medium">{((formDist * formCons) / 100).toFixed(1)} L</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Tiền xăng:</span>
                      <span className="font-medium text-red-500">-{formatCurrency((formDist * formCons / 100) * formPrice)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                      <span>Thu nhập thực tế:</span>
                      <span className="text-blue-600 font-extrabold">{formatCurrency(formRev - ((formDist * formCons / 100) * formPrice))}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium pt-1">
                      <span className="text-gray-500">So với target ({formatCurrency(record.target)}):</span>
                      <span className={formRev - ((formDist * formCons / 100) * formPrice) >= record.target ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>
                        {formRev - ((formDist * formCons / 100) * formPrice) >= record.target ? '+' : ''}
                        {formatCurrency(formRev - ((formDist * formCons / 100) * formPrice) - record.target)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-xl font-bold">Hủy</button>
                <button type="submit" className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-bold">
                  {isEnding ? 'LƯU KẾT THÚC' : 'CẬP NHẬT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
