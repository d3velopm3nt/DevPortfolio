import React, { useState } from "react";
import {
  Settings,
  Code2,
  Monitor,
  Layout,
  Library,
  Github,
} from "lucide-react";
import { TechnologiesManager } from "../components/settings/TechnologiesManager";
import { PlatformsManager } from "../components/settings/PlatformsManager";
import { TechStacksManager } from "../components/settings/TechStacksManager";
import { ResourcesManager } from "../components/settings/ResourcesManager";
import { GitHubSettings } from "../components/settings/GitHubSettings";

type SettingsTab =
  | "technologies"
  | "platforms"
  | "tech-stacks"
  | "resources"
  | "github";

export function SettingsPage() {
  const [currentTab, setCurrentTab] = useState<SettingsTab>("technologies");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Settings className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => setCurrentTab("technologies")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg ${
                currentTab === "technologies"
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Code2 className="w-5 h-5" />
              Technologies
            </button>
            <button
              onClick={() => setCurrentTab("platforms")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg ${
                currentTab === "platforms"
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Monitor className="w-5 h-5" />
              Platforms
            </button>
            <button
              onClick={() => setCurrentTab("tech-stacks")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg ${
                currentTab === "tech-stacks"
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Layout className="w-5 h-5" />
              Tech Stacks
            </button>
            <button
              onClick={() => setCurrentTab("resources")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg ${
                currentTab === "resources"
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Library className="w-5 h-5" />
              Resources
            </button>
            <button
              onClick={() => setCurrentTab("github")}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg ${
                currentTab === "github"
                  ? "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Github className="w-5 h-5" />
              GitHub
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {currentTab === "technologies" ? (
            <TechnologiesManager />
          ) : currentTab === "platforms" ? (
            <PlatformsManager />
          ) : currentTab === "tech-stacks" ? (
            <TechStacksManager />
          ) : currentTab === "resources" ? (
            <ResourcesManager />
          ) : (
            <GitHubSettings />
          )}
        </div>
      </div>
    </div>
  );
}
