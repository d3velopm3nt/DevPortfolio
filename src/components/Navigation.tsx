import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  FolderGit2, 
  Settings, 
  Github,
  TimerIcon,
  LogOut,
  User,
  Code,
  Layout,
  Newspaper,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { useGitHubAuth } from '../hooks/useGitHubAuth';

const mainMenuItems = [
  { 
    label: 'Dashboard', 
    icon: Home,
    path: '/dashboard',
  },
  {
    label: 'Portfolio',
    icon: Layout,
    path: '/portfolio',
    children: [
      { path: '/portfolio/timeline', label: 'Timeline', icon: TimerIcon },
      { path: '/portfolio/tech-stacks', label: 'Tech Stacks', icon: Code },
      { path: '/portfolio/applications', label: 'Applications', icon: Layout },
      { path: '/portfolio/projects', label: 'Projects', icon: FolderGit2 },
    ]
  },
  {
    label: 'Tech Feed',
    icon: Newspaper,
    path: '/tech-feed',
  }
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const { isConnected, username } = useGitHubAuth();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
            DevFolio
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Main Menu */}
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.path} className="relative group">
                    {item.children ? (
                      <>
                        <button
                          onClick={() => toggleDropdown(item.label)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                            isActive(item.path)
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              openDropdown === item.label ? 'transform rotate-180' : ''
                            }`}
                          />
                        </button>
                        {openDropdown === item.label && (
                          <div className="absolute left-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <ChildIcon className="w-4 h-4" />
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                          isActive(item.path)
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* GitHub Status with Dropdown */}
              <div className="relative group">
                <button
                  onClick={() => toggleDropdown('github')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive('/github')
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Github className="w-4 h-4" />
                  {isConnected ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {username}
                    </span>
                  ) : (
                    'GitHub'
                  )}
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openDropdown === 'github' ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openDropdown === 'github' && (
                  <div className="absolute left-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
                    <Link
                      to="/github/repositories"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <FolderGit2 className="w-4 h-4" />
                      Repositories
                    </Link>
                    <Link
                      to="/github/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <Settings className="w-4 h-4" />
                      GitHub Settings
                    </Link>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && user && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.path}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium w-full ${
                        isActive(item.path)
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.label ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openDropdown === item.label && (
                      <div className="pl-4 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400"
                              onClick={() => {
                                setOpenDropdown(null);
                                setIsOpen(false);
                              }}
                            >
                              <ChildIcon className="w-4 h-4" />
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}

          {/* GitHub Mobile Menu */}
          <div>
            <button
              onClick={() => toggleDropdown('github')}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 w-full"
            >
              <span className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                {isConnected ? `GitHub (${username})` : 'GitHub'}
              </span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  openDropdown === 'github' ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {openDropdown === 'github' && (
              <div className="pl-4 space-y-1">
                <Link
                  to="/github/repositories"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400"
                  onClick={() => {
                    setOpenDropdown(null);
                    setIsOpen(false);
                  }}
                >
                  <FolderGit2 className="w-4 h-4" />
                  Repositories
                </Link>
                <Link
                  to="/github/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400"
                  onClick={() => {
                    setOpenDropdown(null);
                    setIsOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4" />
                  GitHub Settings
                </Link>
              </div>
            )}
          </div>

          {/* Settings and Sign Out */}
          <Link
            to="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}