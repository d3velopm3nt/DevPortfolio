import React from 'react';
import { Code2, LayoutDashboard, GitBranch } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">DevPortfolio</span>
            </Link>
            
            <nav className="ml-10 flex items-center gap-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </div>
              </Link>
              
              <Link
                to="/timeline"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/timeline')
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Timeline
                </div>
              </Link>
            </nav>
          </div>
          
          <div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}