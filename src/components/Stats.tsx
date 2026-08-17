import React from 'react';
import { useAppContext } from '../store';
import { formatCurrency, calculateStats } from '../utils';

export const Stats: React.FC = () => {
  const { records } = useAppContext();
  const sortedDates = Object.keys(records).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getStatsForDays = (days: number) => {
    const dates = sortedDates.slice(0, days);
    let totalRevenue = 0;
    let totalFuelCost = 0;
    let totalNet = 0;
    let hitDays = 0;

    dates.forEach(date => {
      const record = records[date];
      const stats = calculateStats(record);
      totalRevenue += record.revenue;
      totalFuelCost += stats.fuelCost;
      totalNet += stats.netIncome;
      if (stats.difference >= 0) hitDays++;
    });

    return {
      count: dates.length,
      totalRevenue,
      totalFuelCost,
      totalNet,
      hitDays,
      avgNet: dates.length > 0 ? totalNet / dates.length : 0
    };
  };

  const stats7 = getStatsForDays(7);
  const stats30 = getStatsForDays(30);

  const StatCard = ({ title, stats }: { title: string, stats: ReturnType<typeof getStatsForDays> }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
      <h3 className="font-bold text-gray-800 mb-4">{title}</h3>
      {stats.count === 0 ? (
        <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Tổng doanh thu:</span>
            <span className="font-medium">{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tổng tiền xăng:</span>
            <span className="font-medium text-red-500">-{formatCurrency(stats.totalFuelCost)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 border-gray-100">
            <span className="text-gray-800 font-bold">Thu nhập thực tế:</span>
            <span className="font-bold text-blue-600">{formatCurrency(stats.totalNet)}</span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Đạt target:</span>
              <span className="font-medium text-green-600">{stats.hitDays}/{stats.count} ngày</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Trung bình/ngày:</span>
              <span className="font-medium">{formatCurrency(stats.avgNet)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Thống kê</h2>
      <StatCard title="7 NGÀY GẦN NHẤT" stats={stats7} />
      <StatCard title="30 NGÀY GẦN NHẤT" stats={stats30} />
    </div>
  );
};
