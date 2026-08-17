import React, { useState } from 'react';
import { useAppContext } from '../store';
import { formatCurrency, formatDateVN, calculateStats } from '../utils';
import { Trash2, Edit } from 'lucide-react';
import { DailyRecord } from '../types';

export const History: React.FC = () => {
  const { records, deleteRecord, updateRecord } = useAppContext();
  const sortedDates = Object.keys(records).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      updateRecord(editingRecord);
      setEditingRecord(null);
    }
  };

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <p>Chưa có dữ liệu lịch sử.</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Lịch sử chạy</h2>
      
      <div className="space-y-4">
        {sortedDates.map(date => {
          const record = records[date];
          const stats = calculateStats(record);
          const isReached = stats.difference >= 0;
          
          return (
            <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">{formatDateVN(date)}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setEditingRecord(record)} className="text-gray-400 p-1 hover:text-blue-500">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => { if(window.confirm('Xóa dữ liệu ngày này?')) deleteRecord(date) }} 
                    className="text-gray-400 p-1 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-500">Mục tiêu:</div>
                <div className="text-right font-medium">{formatCurrency(record.target)}</div>
                
                <div className="text-gray-500">Doanh thu:</div>
                <div className="text-right font-medium">{formatCurrency(record.revenue)}</div>
                
                <div className="text-gray-500">Tiền xăng:</div>
                <div className="text-right font-medium text-red-500">-{formatCurrency(stats.fuelCost)}</div>
                
                <div className="text-gray-500 font-bold mt-1">Thực tế:</div>
                <div className="text-right font-bold text-blue-600 mt-1">{formatCurrency(stats.netIncome)}</div>
                
                <div className="text-gray-500 font-bold">Kết quả:</div>
                <div className={`text-right font-bold ${isReached ? 'text-green-500' : 'text-orange-500'}`}>
                  {isReached ? '+' : ''}{formatCurrency(stats.difference)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">Sửa: {formatDateVN(editingRecord.date)}</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600">Doanh thu</label>
                <input 
                  type="number" min="0" required
                  className="w-full p-2 border rounded-lg"
                  value={editingRecord.revenue}
                  onChange={e => setEditingRecord({...editingRecord, revenue: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Quãng đường (km)</label>
                <input 
                  type="number" min="0" step="0.1" required
                  className="w-full p-2 border rounded-lg"
                  value={editingRecord.distance}
                  onChange={e => setEditingRecord({...editingRecord, distance: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Mục tiêu (VNĐ)</label>
                <input 
                  type="number" min="0" required
                  className="w-full p-2 border rounded-lg"
                  value={editingRecord.target}
                  onChange={e => setEditingRecord({...editingRecord, target: Number(e.target.value)})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingRecord(null)} className="flex-1 p-2 bg-gray-100 rounded-lg">Hủy</button>
                <button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded-lg">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
