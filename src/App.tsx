/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home } from './components/Home';
import { History } from './components/History';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { AppProvider } from './store';
import { Home as HomeIcon, Clock, BarChart2, Settings as SettingsIcon } from 'lucide-react';

type Tab = 'home' | 'history' | 'stats' | 'settings';

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const tabs = [
    { id: 'home', icon: HomeIcon, label: 'Hôm nay' },
    { id: 'history', icon: Clock, label: 'Lịch sử' },
    { id: 'stats', icon: BarChart2, label: 'Thống kê' },
    { id: 'settings', icon: SettingsIcon, label: 'Cài đặt' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      <div className="max-w-md mx-auto min-h-screen relative bg-gray-50 shadow-2xl overflow-hidden flex flex-col">
        <header className="bg-blue-600 text-white p-4 shadow-md z-10 sticky top-0">
          <h1 className="text-xl font-bold text-center">Grab Target Tracker</h1>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'home' && <Home />}
          {activeTab === 'history' && <History />}
          {activeTab === 'stats' && <Stats />}
          {activeTab === 'settings' && <Settings />}
        </main>

        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around pb-safe z-20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon size={24} className={activeTab === tab.id ? 'fill-blue-50' : ''} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

