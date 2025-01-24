import React from 'react';
import { Settings, Code2 } from 'lucide-react';
import { TechnologiesManager } from '../components/settings/TechnologiesManager';

export function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Settings className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              <Code2 className="w-5 h-5" />
              Technologies
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <TechnologiesManager />
        </div>
      </div>
    </div>
  );
}