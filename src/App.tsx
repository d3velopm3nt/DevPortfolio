import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TimelinePage } from './pages/TimelinePage';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navigation />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/timeline" element={<TimelinePage />} />
            </Routes>
          </main>

          <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <p className="text-center text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} John Doe. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </ThemeProvider>
  );
}