import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  ChevronDown,
  Sun,
  Moon,
  Terminal,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { useGitHubAuth } from "../hooks/useGitHubAuth";
import { useTheme } from "../context/ThemeContext";
import { ConfirmDialog } from "./ui/ConfirmDialog";

const mainMenuItems = [
  {
    label: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    label: "Portfolio",
    icon: Layout,
    path: "/portfolio",
    children: [
      { path: "/timeline", label: "Timeline", icon: TimerIcon },
      { path: "/tech-stacks", label: "Tech Stacks", icon: Code },
      { path: "/applications", label: "Applications", icon: Layout },
      { path: "/projects", label: "Projects", icon: FolderGit2 },
    ],
  },
  {
    label: "Tech Feed",
    icon: Newspaper,
    path: "/feed",
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const { isConnected, username } = useGitHubAuth();
  const { theme, toggleTheme } = useTheme();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
  };

  const handleDisconnect = async () => {
    try {
      if (!supabase) throw new Error("Supabase client not initialized");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          github_username: null,
          github_access_token: null,
          github_refresh_token: null,
          github_token_expires_at: null,
          github_last_sync_at: null,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Delete repositories
      await supabase
        .from("github_repositories")
        .delete()
        .eq("user_id", user.id);

      window.location.reload();
    } catch (err) {
      console.error("Error disconnecting GitHub:", err);
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <>
      <nav className="bg-white dark:bg-[#232529] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Theme Toggle */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
              >
                <Terminal className="w-6 h-6" />
                DevPort
              </Link>

              {/* Theme Toggle moved here */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                {/* Main Menu */}
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.path} className="relative group z-50">
                      {item.children ? (
                        <>
                          <button
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                              isActive(item.path)
                                ? "bg-gray-100 dark:bg-[#2A2D35] text-gray-900 dark:text-white"
                                : "text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2D35]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <div className="absolute left-0 w-48 mt-2 py-2 bg-white dark:bg-[#232529] rounded-lg shadow-lg border dark:border-gray-800 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <ChildIcon className="w-4 h-4" />

                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <Link
                          to={item.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                            isActive(item.path)
                              ? "bg-gray-100 dark:bg-[#2A2D35] text-gray-900 dark:text-white"
                              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2D35]"
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
                <div className="relative group z-40">
                  {isConnected ? (
                    <button
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive("/github")
                          ? "bg-gray-100 dark:bg-[#2A2D35] text-gray-900 dark:text-white"
                          : "text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2D35]"
                      }`}
                    >
                      <Github className="w-4 h-4" />
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {username}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          if (!supabase)
                            throw new Error("Supabase client not initialized");
                          const {
                            data: { url },
                            error,
                          } = await supabase.auth.signInWithOAuth({
                            provider: "github",
                            options: {
                              scopes: "repo read:user",
                              redirectTo: `${window.location.origin}/auth/callback`,
                            },
                          });

                          if (error) throw error;
                          if (url) window.location.href = url;
                        } catch (err) {
                          console.error("Error connecting GitHub:", err);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-[#2A2D35] text-white rounded-lg hover:bg-gray-800"
                    >
                      <Github className="w-4 h-4" />
                      Connect GitHub
                    </button>
                  )}
                  {isConnected && (
                    <div className="absolute left-0 w-48 mt-2 py-2 bg-white dark:bg-[#232529] rounded-lg shadow-lg border dark:border-gray-800 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-40">
                      <Link
                        to="/github/repositories"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FolderGit2 className="w-4 h-4" />
                        Repositories
                      </Link>
                      <Link
                        to="/github/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                        GitHub Settings
                      </Link>
                      <button
                        onClick={() => setShowDisconnectDialog(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                      >
                        <X className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative group z-30">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-30">
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
            {user && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && user && (
          <div className="md:hidden py-4 px-4 space-y-2">
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
                            ? "bg-gray-100 dark:bg-[#2A2D35] text-gray-900 dark:text-white"
                            : "text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2D35]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openDropdown === item.label
                              ? "transform rotate-180"
                              : ""
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
                          ? "bg-gray-100 dark:bg-[#2A2D35] text-gray-900 dark:text-white"
                          : "text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2D35]"
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
              {isConnected ? (
                <>
                  <button
                    onClick={() => toggleDropdown("github")}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 w-full"
                  >
                    <span className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      {username}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openDropdown === "github" ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openDropdown === "github" && (
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
                      <button
                        onClick={() => {
                          handleDisconnect();
                          setOpenDropdown(null);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 w-full"
                      >
                        <X className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      if (!supabase)
                        throw new Error("Supabase client not initialized");
                      const {
                        data: { url },
                        error,
                      } = await supabase.auth.signInWithOAuth({
                        provider: "github",
                        options: {
                          scopes: "repo read:user",
                          redirectTo: `${window.location.origin}/auth/callback`,
                        },
                      });

                      if (error) throw error;
                      if (url) window.location.href = url;
                    } catch (err) {
                      console.error("Error connecting GitHub:", err);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 dark:bg-[#2A2D35] w-full"
                >
                  <Github className="w-4 h-4" />
                  Connect GitHub
                </button>
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

      {/* Add Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDisconnectDialog}
        onClose={() => setShowDisconnectDialog(false)}
        onConfirm={handleDisconnect}
        title="Disconnect GitHub"
        message="Are you sure you want to disconnect your GitHub account? This will remove all imported repositories and settings."
        confirmText="Disconnect"
        cancelText="Cancel"
      />
    </>
  );
}
